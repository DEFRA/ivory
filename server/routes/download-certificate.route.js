'use strict'

const fs = require('fs')
const { degrees, PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const moment = require('moment')

const ODataService = require('../services/odata.service')

const {
  DataVerseFieldName,
  DownloadReason,
  Paths
} = require('../utils/constants')

const { SpeciesReverseLookup } = require('../services/dataverse-choice-lookups')

const { isPngImage } = require('../utils/general')

const NONE = 'None'

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

const _getRecord = (id, key) =>
  ODataService.getRecord(id, key, DownloadReason.GENERATE_CERTIFICATE, true)

const _getImage = (id, imageName) => ODataService.getImage(id, imageName)

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

  const ivoryTypeField = form.getTextField('Ivory type')
  ivoryTypeField.setText(
    SpeciesReverseLookup[entity[DataVerseFieldName.SPECIES]]
  )
  ivoryTypeField.defaultUpdateAppearances(timesRomanFont)

  const ivoryLocationField = form.getTextField('Ivory location')
  ivoryLocationField.setText(
    _formatField(entity, DataVerseFieldName.WHERE_IS_THE_IVORY)
  )
  ivoryLocationField.defaultUpdateAppearances(timesRomanFont)

  const distinguishingFeaturesField = form.getTextField(
    'Distinguishing features'
  )
  distinguishingFeaturesField.setText(
    _formatField(entity, DataVerseFieldName.DISTINGUISHING_FEATURES, NONE)
  )
  distinguishingFeaturesField.defaultUpdateAppearances(timesRomanFont)

  await _addImages(entity, pdfDoc, form)

  // Prevents the form fields from being editable
  form.flatten()

  const certificateNumber =
    entity[DataVerseFieldName.CERTIFICATE_NUMBER] ||
    'CERTIFCATE NUMBER NOT ENTERED'
  if (certificateNumber) {
    _addWatermark(pdfDoc, certificateNumber)
  }

  return pdfDoc.save()
}

const _formatField = (entity, fieldName, blankValue = '') =>
  entity[fieldName] || blankValue

const _addImages = async (entity, pdfDoc, form) => {
  const NUMBER_OF_IMAGES = 6

  const dataverseImageNameStub = DataVerseFieldName.PHOTO_1.slice(0, -1)

  for (let i = 1; i <= NUMBER_OF_IMAGES; i++) {
    const bufferedImage = await _getImage(
      entity[DataVerseFieldName.SECTION_2_CASE_ID],
      `${dataverseImageNameStub}${i}`
    )

    if (bufferedImage.length) {
      const imageBase64 = bufferedImage.toString('base64')

      let embeddedImage
      if (isPngImage(imageBase64)) {
        embeddedImage = await pdfDoc.embedPng(bufferedImage)
      } else {
        embeddedImage = await pdfDoc.embedJpg(bufferedImage)
      }

      const photo = form.getButton(`Photo ${i}`)
      photo.setImage(embeddedImage)
    }
  }
}

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
    path: `${Paths.DOWNLOAD_CERTIFICATE}/{id}`,
    handler: handlers.get
  }
]
