'use strict'

const fs = require('fs')

const { PDFDocument, StandardFonts } = require('pdf-lib')

// const AnalyticsService = require('../services/analytics.service')
const ODataService = require('../../services/odata.service')

const {
  // Analytics,
  DataVerseFieldName,
  Paths,
  ItemType
} = require('../../utils/constants')

const formPdfBytes = fs.readFileSync(
  './server/public/static/ivory-application-download-template.pdf'
)

const FormFields = {
  ALREADY_CERTIFIED: 'Already certified',
  APPLICANT_ADDRESS: 'Applicant address',
  APPLICANT_NAME: 'Applicant name',
  APPLIED_BEFORE: 'Applied before',
  EXEMPTION_TYPE: 'Type of exemption',
  IVORY_LOCATION: 'Where is it',
  OWNER_ADDRESS: 'Owner address',
  OWNER_NAME: 'Owner name',
  PREVIOUS_APPLICATION_NUMBER: 'Previous app number',
  PROOF_OF_AGE: 'Proof of age',
  REVOKED_CERTIFICATE_NUMBER: 'Revoked cert number',
  UNIQUE_FEATURES: 'Unique features',
  WHAT_IS_IT: 'What is it',
  WHEN_MADE: 'When was it made',
  WHERE_IS_IT: 'Where is it',
  WHERE_MADE: 'Where was it made',
  WHY_RMI: 'Why is it high value'
}

const NOTHING_ENTERED = 'Nothing entered'

const handlers = {
  get: async (request, h) => {
    const id = request.query.id
    const key = request.query.key

    console.log('Application details PDF')
    console.log('id:', id)
    console.log('key:', key)

    const entity = await _getRecord(id, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    // TODO remove this
    console.log(entity)

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

const _getPdf = async entity => {
  const pdfDoc = await PDFDocument.load(formPdfBytes)

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  const form = pdfDoc.getForm()

  let field

  field = form.getTextField(FormFields.OWNER_NAME)
  field.setText(_formatField(entity, DataVerseFieldName.OWNER_NAME))

  field = form.getTextField(FormFields.OWNER_ADDRESS)
  field.setText(_formatField(entity, DataVerseFieldName.OWNER_ADDRESS))

  field = form.getTextField(FormFields.APPLICANT_NAME)
  field.setText(_formatField(entity, DataVerseFieldName.APPLICANT_NAME))

  field = form.getTextField(FormFields.APPLICANT_ADDRESS)
  field.setText(_formatField(entity, DataVerseFieldName.APPLICANT_ADDRESS))

  field = form.getTextField(FormFields.EXEMPTION_TYPE)
  field.setText(ItemType.HIGH_VALUE)

  field = form.getTextField(FormFields.WHAT_IS_IT)
  field.setText(_formatField(entity, DataVerseFieldName.ITEM_SUMMARY))

  field = form.getTextField(FormFields.IVORY_LOCATION)
  field.setText(_formatField(entity, DataVerseFieldName.WHERE_IS_THE_IVORY))

  field = form.getTextField(FormFields.UNIQUE_FEATURES)
  field.setText(
    _formatField(entity, DataVerseFieldName.UNIQUE_FEATURES, NOTHING_ENTERED)
  )

  field = form.getTextField(FormFields.WHERE_MADE)
  field.setText(
    _formatField(entity, DataVerseFieldName.WHERE_IT_WAS_MADE, NOTHING_ENTERED)
  )

  field = form.getTextField(FormFields.WHEN_MADE)
  field.setText(
    _formatField(entity, DataVerseFieldName.WHEN_IT_WAS_MADE, NOTHING_ENTERED)
  )

  field = form.getTextField(FormFields.WHY_RMI)
  field.setText(
    _formatField(
      entity,
      DataVerseFieldName.WHY_OUTSTANDINLY_VALUABLE,
      NOTHING_ENTERED
    )
  )

  Object.keys(FormFields).forEach(fieldName => {
    field = form.getTextField(FormFields[fieldName])
    field.defaultUpdateAppearances(timesRomanFont)
  })

  // Prevents the form fields from being editable
  form.flatten()

  const pdfBytes = await pdfDoc.save()

  return pdfBytes
}

const _formatField = (entity, fieldName, blankValue = '') => {
  return entity[fieldName] || blankValue
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_APPLICATION_PDF}`,
    handler: handlers.get
  }
]
