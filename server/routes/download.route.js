'use strict'

const fs = require('fs')
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const moment = require('moment')

const ODataService = require('../services/odata.service')
const { DataVerseFieldName } = require('../utils/constants')
const { Paths } = require('../utils/constants')

const NOTHING_ENTERED = 'Nothing entered'
const PNG_IMAGE_REGEXP = /^iVBORw0KGgo/g

const formPdfBytes = fs.readFileSync(
  './server/public/static/ivory-certificate-template.pdf'
)

const handlers = {
  get: async (request, h) => {
    const id = request.params.id
    const key = request.query.key

    const entity = await _getRecord(id, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    const pdfBytes = await _getPdf(entity)

    return h
      .response(Buffer.from(pdfBytes))
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'inline; filename=certificate.pdf')
      .takeover()
  }
}

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key)
}

const _getImage = (id, imageName) => {
  return ODataService.getImage(id, imageName)
}

const _getPdf = async entity => {
  const pdfDoc = await PDFDocument.load(formPdfBytes)

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesRomanBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold
  )

  const form = pdfDoc.getForm()

  const certificateNumberField = form.getTextField('Certificate number')
  certificateNumberField.setText(
    _formatField(entity, DataVerseFieldName.CERTIFICATE_NUMBER)
  )
  certificateNumberField.defaultUpdateAppearances(timesRomanBoldFont)

  const dateIssuedField = form.getTextField('Date issued')
  let date = entity[DataVerseFieldName.CERTIFICATE_ISSUE_DATE]
  date = date ? moment(date).format('DD/MM/YYYY') : ''
  dateIssuedField.setText(date)
  dateIssuedField.defaultUpdateAppearances(timesRomanFont)

  const typeOfItemField = form.getTextField('Type of item')
  typeOfItemField.setText(_formatField(entity, DataVerseFieldName.ITEM_SUMMARY))
  typeOfItemField.defaultUpdateAppearances(timesRomanFont)

  const ivoryLocationField = form.getTextField('Ivory location')
  ivoryLocationField.setText(
    _formatField(entity, DataVerseFieldName.WHERE_IS_THE_IVORY)
  )
  ivoryLocationField.defaultUpdateAppearances(timesRomanFont)

  const uniqueFeaturesField = form.getTextField('Unique features')
  uniqueFeaturesField.setText(
    _formatField(entity, DataVerseFieldName.UNIQUE_FEATURES, NOTHING_ENTERED)
  )
  uniqueFeaturesField.defaultUpdateAppearances(timesRomanFont)

  const whereItWasMadeField = form.getTextField('Where it was made')
  whereItWasMadeField.setText(
    _formatField(entity, DataVerseFieldName.WHERE_IT_WAS_MADE, NOTHING_ENTERED)
  )
  whereItWasMadeField.defaultUpdateAppearances(timesRomanFont)

  const whenItWasMadeField = form.getTextField('When it was made')
  whenItWasMadeField.setText(
    _formatField(entity, DataVerseFieldName.WHEN_IT_WAS_MADE, NOTHING_ENTERED)
  )
  whenItWasMadeField.defaultUpdateAppearances(timesRomanFont)

  await _addImages(entity, pdfDoc, form)

  // Prevents the form fields from being editable
  form.flatten()

  const certificateNumber =
    entity[DataVerseFieldName.CERTIFICATE_NUMBER] ||
    'CERTIFCATE NUMBER NOT ENTERED'
  if (certificateNumber) {
    _addWatermark(pdfDoc, certificateNumber)
  }

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}

const _formatField = (entity, fieldName, blankValue = '') => {
  return entity[fieldName] || blankValue
}

const _addImages = async (entity, pdfDoc, form) => {
  const NUMBER_OF_IMAGES = 6

  const dataverseImageNameStub = DataVerseFieldName.PHOTO_1.slice(0, -1)

  for (let i = 1; i <= NUMBER_OF_IMAGES; i++) {
    const image = await _getImage(
      entity[DataVerseFieldName.SECTION_2_CASE_ID],
      `${dataverseImageNameStub}${i}`
    )

    const imageBuffered = await image.buffer()

    if (imageBuffered.length) {
      const imageBase64 = imageBuffered.toString('base64')

      let embeddedImage
      if (_isPngImage(imageBase64)) {
        embeddedImage = await pdfDoc.embedPng(imageBuffered)
      } else {
        embeddedImage = await pdfDoc.embedJpg(imageBuffered)
      }

      const photo = form.getButton(`Photo ${i}`)
      photo.setImage(embeddedImage)
    }
  }
}

// Returns a boolean to indicate if the base64 string parameter contains a PNG image.
// All PNG images, when encoded in base64, begin with iVBORw0KGgo
// When we get the image out of the Dataverse we don't know if it is PNG or JPG.
const _isPngImage = imageBase64 => imageBase64.match(PNG_IMAGE_REGEXP)

// Uses the certificate number to create a repeating text watermark across all of the pages
const _addWatermark = async (pdfDoc, certificateNumber) => {
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  let submissionReferenceWaterMarkLine = ''
  for (let i = 0; i < 500; i++) {
    submissionReferenceWaterMarkLine += `${certificateNumber} `
  }
  const opacity = 0.08

  const pages = pdfDoc.getPages()
  for (const page of pages) {
    for (let y = -500; y < 1000; y += 40) {
      page.drawText(submissionReferenceWaterMarkLine, {
        x: 0,
        y: y - 100,
        size: 20,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
        rotate: degrees(45),
        opacity
      })
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.DOWNLOAD}/{id}`,
    handler: handlers.get
  }
]
