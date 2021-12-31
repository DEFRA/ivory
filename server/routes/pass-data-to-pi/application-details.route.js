'use strict'

const ODataService = require('../../services/odata.service')

const {
  AgeExemptionReasons,
  AlreadyCertifiedOptions,
  DataVerseFieldName,
  DownloadReason,
  ItemType,
  Options,
  Paths,
  Views
} = require('../../utils/constants')

const {
  AgeExemptionReasonLookup,
  AgeExemptionReasonReverseLookup,
  AlreadyCertifiedLookup,
  AlreadyCertifiedReverseLookup
} = require('../../services/dataverse-choice-lookups')

const NONE = 'None'
const NOTHING_ENTERED = 'Nothing entered'
const DOWNLOAD_LINK_TEXT = 'Download'
const MAX_DOCUMENTS = 6
const MAX_PHOTOS = 6

const handlers = {
  get: async (request, h) => {
    const id = request.query.id
    const key = request.query.key

    const entity = await _getRecord(id, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    return h.view(Views.PASS_DATA_TO_PI, {
      ..._getContext(entity, key)
    })
  }
}

const _getContext = (entity, key) => {
  const isOwnedByApplicant = entity[DataVerseFieldName.OWNED_BY_APPLICANT]
  const id = entity[DataVerseFieldName.SECTION_2_CASE_ID]
  const submissionReference = entity[DataVerseFieldName.NAME]

  const itemSummary = _getItemSummary(entity)
  const documentSummary = _getDocumentSummary(entity, key)
  const exemptionReasonSummary = _getExemptionReasonSummary(entity)
  const itemDescriptionSummary = _getItemDescriptionSummary(entity)
  const ownerSummary = _getOwnerSummary(entity, isOwnedByApplicant)
  const photoSummary = _getPhotoSummary(entity, key)

  return {
    itemSummary,
    photoSummary,
    itemDescriptionSummary,
    exemptionReasonSummary,
    documentSummary,
    ownerSummary,
    ownerSummaryHeading: isOwnedByApplicant
      ? 'Owner’s details'
      : 'Owner and applicant details',
    hideBackLink: true,
    pageTitle: `Ivory application: ${submissionReference}`,
    pdfDownloadLink: `${Paths.PASS_DATA_TO_PI_APPLICATION_PDF}?id=${id}&key=${key}`
  }
}

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key, DownloadReason.SEND_DATA_TO_PI)
}

const _getDocumentSummary = (entity, key) => {
  const uploadDocuments = []

  for (let i = 1; i <= MAX_DOCUMENTS; i++) {
    const dataverseFieldName = DataVerseFieldName[`SUPPORTING_EVIDENCE_${i}`]
    const filename = entity[DataVerseFieldName[`SUPPORTING_EVIDENCE_${i}_NAME`]]
    const id = entity[DataVerseFieldName[dataverseFieldName]]

    if (filename) {
      uploadDocuments.push({
        id,
        filename,
        dataverseFieldName
      })
    }
  }

  uploadDocuments.forEach((uploadDocument, index) => {
    uploadDocument.row = `<p id="document${index}">${uploadDocument.filename}</p>`
  })

  return uploadDocuments.map((uploadDocument, index) => {
    return _getSummaryListRow(
      `Document ${index + 1}`,
      uploadDocument.row,
      _getChangeItems(
        `${Paths.PASS_DATA_TO_PI_DOCUMENTS}?record_id=${
          entity[DataVerseFieldName.SECTION_2_CASE_ID]
        }&dataverseFieldName=${uploadDocument.dataverseFieldName}&filename=${
          uploadDocument.filename
        }&key=${key}`,
        `Document ${index + 1}`
      ),
      true
    )
  })
}

const _getExemptionReasonSummary = entity => {
  const whyAgeExempt = entity[DataVerseFieldName.WHY_AGE_EXEMPT]
  const whyAgeExemptOtherReason =
    entity[DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON]

  const whyAgeExemptReasons = whyAgeExempt.split(',')

  const ivoryAgeFormatted = whyAgeExemptReasons.map((reason, index) => {
    const reasonText =
      reason === `${AgeExemptionReasonLookup[AgeExemptionReasons.OTHER_REASON]}`
        ? whyAgeExemptOtherReason
        : AgeExemptionReasonReverseLookup[parseInt(reason)]

    return `<li id="ivoryAgeReason${index}">${reasonText}</li>`
  })

  const ivoryAgeList = `<ul>${ivoryAgeFormatted.join('')}</ul>`

  const whyRmi = entity[DataVerseFieldName.WHY_OUTSTANDINLY_VALUABLE]

  const exemptionReasonSummary = [
    _getSummaryListRow('Proof of item’s age', ivoryAgeList, null, true)
  ]

  exemptionReasonSummary.push(
    _getSummaryListRow('Why it’s of outstandingly high value', whyRmi)
  )

  return exemptionReasonSummary
}

const _getItemSummary = entity => {
  const itemSummary = [
    _getSummaryListRow('Type of exemption', ItemType.HIGH_VALUE)
  ]

  const alreadyCertified =
    AlreadyCertifiedReverseLookup[
      entity[DataVerseFieldName.ALREADY_HAS_CERTIFICATE]
    ]

  const isAlreadyCertified =
    alreadyCertified === AlreadyCertifiedLookup[AlreadyCertifiedOptions.YES]

  const revokedCertificateNumber =
    entity[DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER]

  const hasAppliedBefore = entity[DataVerseFieldName.APPLIED_BEFORE]

  itemSummary.push(
    _getSummaryListRow('Already has a certificate', alreadyCertified)
  )

  if (isAlreadyCertified) {
    itemSummary.push(
      _getSummaryListRow(
        'Certificate number',
        entity[DataVerseFieldName.CERTIFICATE_NUMBER]
      )
    )
  }

  if (revokedCertificateNumber) {
    itemSummary.push(
      _getSummaryListRow('Revoked certificate number', revokedCertificateNumber)
    )
  }

  if (alreadyCertified === AlreadyCertifiedOptions.NO) {
    itemSummary.push(
      _getSummaryListRow(
        'Applied before',
        hasAppliedBefore ? Options.YES : Options.NO
      )
    )
  }

  if (hasAppliedBefore) {
    itemSummary.push(
      _getSummaryListRow(
        'Previous application number',
        entity[DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER]
      )
    )
  }

  return itemSummary
}

const _getItemDescriptionSummary = entity => {
  const itemDescriptionSummary = [
    _getSummaryListRow('What is it?', entity[DataVerseFieldName.ITEM_SUMMARY]),

    _getSummaryListRow(
      'Where’s the ivory?',
      entity[DataVerseFieldName.WHERE_IS_THE_IVORY]
    ),

    _getSummaryListRow(
      'Distinguishing features',
      entity[DataVerseFieldName.DISTINGUISHING_FEATURES] || NONE
    )
  ]

  itemDescriptionSummary.push(
    _getSummaryListRow(
      'Where was it made? (optional)',
      entity[DataVerseFieldName.WHERE_IT_WAS_MADE] || NOTHING_ENTERED
    )
  )

  itemDescriptionSummary.push(
    _getSummaryListRow(
      'When was it made? (optional)',
      entity[DataVerseFieldName.WHEN_IT_WAS_MADE] || NOTHING_ENTERED
    )
  )

  return itemDescriptionSummary
}

const _getOwnerSummary = (entity, isOwnedByApplicant) => {
  const ownerName = entity[DataVerseFieldName.OWNER_NAME]

  let ownerAddress = entity[DataVerseFieldName.OWNER_ADDRESS]

  const ownerPostcode = entity[DataVerseFieldName.OWNER_POSTCODE]
  if (ownerPostcode) {
    ownerAddress += `\n${ownerPostcode}`
  }

  if (ownerAddress) {
    ownerAddress = ownerAddress.replaceAll('\n', '<br/>')
  }

  const applicantName = entity[DataVerseFieldName.APPLICANT_NAME]

  let applicantAddress = entity[DataVerseFieldName.APPLICANT_ADDRESS]
  const applicantPostcode = entity[DataVerseFieldName.APPLICANT_POSTCODE]
  if (applicantPostcode) {
    applicantAddress += `\n${applicantPostcode}`
  }

  if (applicantAddress) {
    applicantAddress = applicantAddress.replaceAll('\n', '<br/>')
  }

  const ownerSummary = []

  if (isOwnedByApplicant) {
    _getOwnerDetails(ownerSummary, ownerName, ownerAddress)
  } else {
    if (ownerName) {
      _getOwnerDetails(ownerSummary, ownerName, ownerAddress)
    }
    _getApplicantDetails(ownerSummary, applicantName, applicantAddress)
  }

  return ownerSummary
}

const _getOwnerDetails = (ownerSummary, ownerName, ownerAddress) => {
  ownerSummary.push(_getSummaryListRow('Owner’s name', ownerName))
  ownerSummary.push(
    _getSummaryListRow('Owner’s address', ownerAddress, null, true)
  )
}

const _getApplicantDetails = (
  ownerSummary,
  applicantName,
  applicantAddress
) => {
  ownerSummary.push(_getSummaryListRow('Applicant’s name', applicantName))
  ownerSummary.push(
    _getSummaryListRow('Applicant’s address', applicantAddress, null, true)
  )
}

const _getPhotoSummary = (entity, key) => {
  const uploadPhotos = []

  const recordId = entity[DataVerseFieldName.SECTION_2_CASE_ID]

  for (let i = 1; i <= MAX_PHOTOS; i++) {
    const id = entity[DataVerseFieldName[`PHOTO_${i}_ID`]]
    const file = entity[DataVerseFieldName[`PHOTO_${i}`]]

    if (file) {
      uploadPhotos.push({ id, file, index: i })
    }
  }

  uploadPhotos.forEach((uploadPhoto, index) => {
    const imageFile = `data:image;base64,${uploadPhoto.file}`

    uploadPhoto.row = `<img id="photo${index +
      1}" class="govuk-!-padding-bottom-5" src=${imageFile} alt="Photo ${index +
      1}" width="200">`
  })

  return uploadPhotos.map((uploadPhoto, index) => {
    return _getSummaryListRow(
      `Photo ${index + 1}`,
      uploadPhoto.row,
      _getChangeItems(
        `${Paths.PASS_DATA_TO_PI_PHOTOS}?record_id=${recordId}&index=${uploadPhoto.index}&key=${key}`,
        `Photo ${index + 1}`
      ),
      true
    )
  })
}

const _getSummaryListRow = (key, value, items = null, isHtml = false) => {
  if (items && items.length) {
    items.forEach(item => (item.text = DOWNLOAD_LINK_TEXT))
  }

  const row = {
    key: {
      text: key
    },
    value: {
      [`${isHtml ? 'html' : 'text'}`]: value
    }
  }

  if (items) {
    row.actions = {
      items
    }
  }

  return row
}

const _getChangeItems = (href, visuallyHiddenText) => [
  {
    href,
    visuallyHiddenText,
    attributes: {
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  }
]

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI}`,
    handler: handlers.get
  }
]
