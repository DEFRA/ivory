'use strict'

const fs = require('fs')

const { PDFDocument, StandardFonts } = require('pdf-lib')

const ODataService = require('../../services/odata.service')

const {
  AgeExemptionReasons,
  DataVerseFieldName,
  DownloadReason,
  Paths,
  ItemType,
  Options
} = require('../../utils/constants')

const {
  AgeExemptionReasonLookup,
  AgeExemptionReasonReverseLookup
} = require('../../services/dataverse-choice-lookups')

const {
  SpeciesReverseLookup
} = require('../../services/dataverse-choice-lookups')

const formPdfBytes = fs.readFileSync(
  './server/public/static/ivory-application-download-template.pdf'
)

const FormFields = {
  ALREADY_CERTIFIED: 'Already certified',
  APPLICANT_ADDRESS: 'Applicant address',
  APPLICANT_NAME: 'Applicant name',
  APPLIED_BEFORE: 'Applied before',
  DISTINGUISHING_FEATURES: 'Distinguishing features',
  EXEMPTION_TYPE: 'Type of exemption',
  IVORY_APPLICATION: 'Ivory application',
  IVORY_LOCATION: 'Where is it',
  IVORY_TYPE: 'Ivory type',
  OWNER_ADDRESS: 'Owner address',
  OWNER_NAME: 'Owner name',
  PREVIOUS_APPLICATION_NUMBER: 'Previous app number',
  PROOF_OF_AGE: 'Proof of age',
  REVOKED_CERTIFICATE_NUMBER: 'Revoked cert number',
  WHAT_IS_IT: 'What is it',
  WHEN_MADE: 'When was it made',
  WHERE_IS_IT: 'Where is it',
  WHERE_MADE: 'Where was it made',
  WHY_RMI: 'Why is it high value'
}

const NONE = 'None'
const NOTHING_ENTERED = 'Nothing entered'

const handlers = {
  get: async (request, h) => {
    const id = request.query.id
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
  ODataService.getRecord(id, key, DownloadReason.SEND_DATA_TO_PI, true)

const _getPdf = async entity => {
  const pdfDoc = await PDFDocument.load(formPdfBytes)

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

  const form = pdfDoc.getForm()

  let field
  const revokedCertNumber = _formatField(
    entity,
    DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER,
    false
  )
  const appliedBefore = _formatField(
    entity,
    DataVerseFieldName.APPLIED_BEFORE,
    false
  )

  field = form.getTextField(FormFields.IVORY_APPLICATION)
  field.setText(_formatField(entity, DataVerseFieldName.NAME))

  field = form.getTextField(FormFields.OWNER_NAME)
  field.setText(_formatField(entity, DataVerseFieldName.OWNER_NAME))

  field = form.getTextField(FormFields.OWNER_ADDRESS)
  const ownerAddress = entity[DataVerseFieldName.OWNER_ADDRESS]
  const ownerPostcode = entity[DataVerseFieldName.OWNER_POSTCODE]
  field.setText(_formatAddress(ownerAddress, ownerPostcode))

  field = form.getTextField(FormFields.APPLICANT_NAME)
  field.setText(_formatField(entity, DataVerseFieldName.APPLICANT_NAME))

  field = form.getTextField(FormFields.APPLICANT_ADDRESS)
  const applicantAddress = entity[DataVerseFieldName.APPLICANT_ADDRESS]
  const applicantPostcode = entity[DataVerseFieldName.APPLICANT_POSTCODE]
  field.setText(_formatAddress(applicantAddress, applicantPostcode))

  field = form.getTextField(FormFields.EXEMPTION_TYPE)
  field.setText(ItemType.HIGH_VALUE)

  field = form.getTextField(FormFields.ALREADY_CERTIFIED)
  field.setText(revokedCertNumber ? Options.YES : Options.NO)

  field = form.getTextField(FormFields.REVOKED_CERTIFICATE_NUMBER)
  field.setText(revokedCertNumber || NOTHING_ENTERED)

  field = form.getTextField(FormFields.APPLIED_BEFORE)
  field.setText(appliedBefore ? Options.YES : Options.NO)

  field = form.getTextField(FormFields.PREVIOUS_APPLICATION_NUMBER)
  field.setText(
    _formatField(
      entity,
      DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER,
      NOTHING_ENTERED
    )
  )

  field = form.getTextField(FormFields.WHAT_IS_IT)
  field.setText(_formatField(entity, DataVerseFieldName.ITEM_SUMMARY))

  field = form.getTextField(FormFields.IVORY_TYPE)
  field.setText(SpeciesReverseLookup[entity[DataVerseFieldName.SPECIES]])

  field = form.getTextField(FormFields.IVORY_LOCATION)
  field.setText(_formatField(entity, DataVerseFieldName.WHERE_IS_THE_IVORY))

  field = form.getTextField(FormFields.DISTINGUISHING_FEATURES)
  field.setText(
    _formatField(entity, DataVerseFieldName.DISTINGUISHING_FEATURES, NONE)
  )

  field = form.getTextField(FormFields.WHERE_MADE)
  field.setText(
    _formatField(entity, DataVerseFieldName.WHERE_IT_WAS_MADE, NOTHING_ENTERED)
  )

  field = form.getTextField(FormFields.WHEN_MADE)
  field.setText(
    _formatField(entity, DataVerseFieldName.WHEN_IT_WAS_MADE, NOTHING_ENTERED)
  )

  field = form.getTextField(FormFields.PROOF_OF_AGE)
  field.setText(_getExemptionReasonSummary(entity))

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

  return pdfDoc.save()
}

const _formatField = (entity, fieldName, blankValue = '') =>
  entity[fieldName] || blankValue

const _formatAddress = (address, postcode) =>
  `${address}${postcode && postcode.length ? '\n' + postcode : ''}`

const _getExemptionReasonSummary = entity => {
  const whyAgeExempt = entity[DataVerseFieldName.WHY_AGE_EXEMPT]
  const whyAgeExemptOtherReason =
    entity[DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON]

  const whyAgeExemptReasons = whyAgeExempt.split(',')

  const ivoryAgeFormatted = whyAgeExemptReasons.map(reason => {
    const reasonText =
      reason === `${AgeExemptionReasonLookup[AgeExemptionReasons.OTHER_REASON]}`
        ? whyAgeExemptOtherReason
        : AgeExemptionReasonReverseLookup[parseInt(reason)]

    return `- ${reasonText}`
  })

  return `${ivoryAgeFormatted.join('\n')}`
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_APPLICATION_PDF}`,
    handler: handlers.get
  }
]
