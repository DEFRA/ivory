'use strict'

// const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../../services/redis.service')
const ODataService = require('../../services/odata.service')

const {
  AlreadyCertifiedOptions,
  // Analytics,
  DataVerseFieldName,
  ItemType,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')

const {
  // AgeExemptionReasonLookup,
  // ExemptionTypeLookup,
  // IntentionLookup,
  // IvoryIntegralLookup,
  // IvoryVolumeLookup,
  // Status,
  // SellingOnBehalfOfLookup,
  // CapacityLookup,
  AlreadyCertifiedLookup,
  AlreadyCertifiedReverseLookup,
  SellingOnBehalfOfReverseLookup
} = require('../../services/dataverse-choice-lookups')

const NOTHING_ENTERED = 'Nothing entered'
const DOWNLOAD_LINK_TEXT = 'Download'
const MAX_DOCUMENTS = 6
const MAX_PHOTOS = 6

const handlers = {
  get: async (request, h) => {
    const id = request.query.id
    const key = request.query.key

    console.log('id:', id)
    console.log('key:', key)

    const entity = await _getRecord(id, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    const context = await _getContext(request, entity, key)

    return h.view(Views.PASS_DATA_TO_PI, {
      ...context
    })
  }
}

const _getContext = async (request, entity, key) => {
  const itemType = ItemType.HIGH_VALUE
  const isOwnedByApplicant = entity[DataVerseFieldName.OWNED_BY_APPLICANT]

  const [
    itemSummary,
    documentSummary,
    exemptionReasonSummary,
    itemDescriptionSummary,
    ownerSummary,
    photoSummary
  ] = await Promise.all([
    _getItemSummary(entity, itemType),
    _getDocumentSummary(entity, key),
    _getExemptionReasonSummary(entity, request, itemType),
    _getItemDescriptionSummary(entity),
    _getOwnerSummary(entity, request, isOwnedByApplicant),
    _getPhotoSummary(entity, key)
  ])

  const id = entity[DataVerseFieldName.SECTION_2_CASE_ID]
  const submissionReference = entity[DataVerseFieldName.NAME]

  console.log(entity)

  return {
    itemSummary,
    photoSummary,
    itemDescriptionSummary,
    exemptionReasonSummary,
    documentSummary,
    ownerSummary,
    pageTitle: `Ivory application: ${submissionReference}`,
    pdfDownloadLink: `${Paths.PASS_DATA_TO_PI_APPLICATION_PDF}?id=${id}&key=${key}`
  }
}

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key)
}

const _getDocumentSummary = async (entity, key) => {
  const uploadDocuments = []

  for (let i = 1; i <= MAX_DOCUMENTS; i++) {
    const filename = entity[DataVerseFieldName[`SUPPORTING_EVIDENCE_${i}_NAME`]]
    const id = entity[DataVerseFieldName[`SUPPORTING_EVIDENCE_${i}`]]

    if (filename) {
      uploadDocuments.push({ id, filename })
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
        `${Paths.PASS_DATA_TO_PI_DOCUMENTS}?id=${uploadDocument.id}&key=${key}`,
        DOWNLOAD_LINK_TEXT
      ),
      true
    )
  })
}

const _getExemptionReasonSummary = async (entity, request, itemType) => {
  const ivoryAge = await RedisService.get(request, RedisKeys.IVORY_AGE)

  if (ivoryAge && ivoryAge.otherReason) {
    ivoryAge.ivoryAge.pop()
    ivoryAge.ivoryAge.push(ivoryAge.otherReason)
  }

  const ivoryAgeFormatted =
    ivoryAge && ivoryAge.ivoryAge
      ? ivoryAge.ivoryAge.map((reason, index) => {
          return `<li id="ivoryAgeReason${index}">${reason}</li>`
        })
      : []

  const ivoryAgeList = `<ul>${ivoryAgeFormatted.join('')}</ul>`

  const whyRmi = entity[DataVerseFieldName.WHY_OUTSTANDINLY_VALUABLE]

  let ivoryIntegral = await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)
  if (ivoryIntegral === 'Both of the above') {
    ivoryIntegral =
      'The ivory is essential to the design or function of the item and you cannot remove the ivory easily or without damaging the item'
  }

  const exemptionReasonSummary = [
    _getSummaryListRow('Proof of item’s age', ivoryAgeList, null, true)
  ]

  exemptionReasonSummary.push(
    _getSummaryListRow('Why it’s of outstandingly high value', whyRmi)
  )

  if (itemType === ItemType.TEN_PERCENT) {
    exemptionReasonSummary.push(
      _getSummaryListRow('Why all ivory is integral', ivoryIntegral)
    )
  }

  return exemptionReasonSummary
}

const _getItemSummary = async (entity, itemType) => {
  const itemSummary = [_getSummaryListRow('Type of exemption', itemType)]

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

const _getItemDescriptionSummary = async entity => {
  const itemDescriptionSummary = [
    _getSummaryListRow('What is it?', entity[DataVerseFieldName.ITEM_SUMMARY]),

    _getSummaryListRow(
      'Where’s the ivory?',
      entity[DataVerseFieldName.WHERE_IS_THE_IVORY]
    ),

    _getSummaryListRow(
      'Unique, identifying features (optional)',
      entity[DataVerseFieldName.UNIQUE_FEATURES] || NOTHING_ENTERED
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

const _getOwnerSummary = async (entity, request, isOwnedByApplicant) => {
  const sellingOnBehalfOf =
    SellingOnBehalfOfReverseLookup[
      entity[DataVerseFieldName.SELLING_ON_BEHALF_OF]
    ]

  const workForABusiness = entity[DataVerseFieldName.WORK_FOR_A_BUSINESS]
    ? Options.YES
    : Options.NO

  const capacity = _formatCapacity(
    await RedisService.get(request, RedisKeys.WHAT_CAPACITY)
  )

  const ownerContactDetails =
    (await RedisService.get(request, RedisKeys.OWNER_CONTACT_DETAILS)) || {}

  const ownerAddress = await RedisService.get(request, RedisKeys.OWNER_ADDRESS)

  const applicantContactDetails =
    (await RedisService.get(request, RedisKeys.APPLICANT_CONTACT_DETAILS)) || {}

  const applicantAddress = await RedisService.get(
    request,
    RedisKeys.APPLICANT_ADDRESS
  )

  const ownerSummary = [
    _getSummaryListRow(
      'Do you own the item?',
      isOwnedByApplicant ? Options.YES : Options.NO
    )
  ]

  if (isOwnedByApplicant) {
    await _getOwnerSummaryOwnedByApplicant(
      ownerSummary,
      ownerContactDetails,
      ownerAddress
    )
  } else {
    if (sellingOnBehalfOf === 'The business I work for') {
      await _getOwnerSummaryApplicantBusiness(
        ownerSummary,
        workForABusiness,
        sellingOnBehalfOf,
        applicantContactDetails,
        applicantAddress
      )
    } else if (sellingOnBehalfOf === 'Other') {
      await _getOwnerSummaryApplicantOther(
        ownerSummary,
        workForABusiness,
        sellingOnBehalfOf,
        capacity,
        applicantContactDetails,
        applicantAddress
      )
    } else {
      await _getOwnerSummaryApplicantDefault(
        ownerSummary,
        workForABusiness,
        sellingOnBehalfOf,
        ownerContactDetails,
        ownerAddress,
        applicantContactDetails,
        applicantAddress
      )
    }
  }

  return ownerSummary
}

const _formatCapacity = whatCapacity => {
  let capacity
  if (whatCapacity && whatCapacity.whatCapacity) {
    capacity = whatCapacity.whatCapacity

    if (capacity === 'Other') {
      capacity += ` - ${whatCapacity.otherCapacity}`
    }
  }

  return capacity
}

const _getOwnerSummaryOwnedByApplicant = async (
  ownerSummary,
  ownerContactDetails,
  ownerAddress
) => {
  ownerSummary.push(
    _getSummaryListRow('Your name', ownerContactDetails.fullName)
  )

  ownerSummary.push(
    _getSummaryListRow('Your email', ownerContactDetails.emailAddress)
  )

  ownerSummary.push(_getSummaryListRow('Your address', ownerAddress))
}

const _getOwnerSummaryApplicantBusiness = async (
  ownerSummary,
  workForABusiness,
  sellingOnBehalfOf,
  applicantContactDetails,
  applicantAddress
) => {
  ownerSummary.push(_getSummaryListRow('Work for a business', workForABusiness))

  ownerSummary.push(
    _getSummaryListRow('Selling on behalf of', sellingOnBehalfOf)
  )

  ownerSummary.push(
    _getSummaryListRow('Your name', applicantContactDetails.fullName)
  )

  if (workForABusiness === Options.YES) {
    ownerSummary.push(
      _getSummaryListRow(
        'Business name',
        applicantContactDetails.businessName || NOTHING_ENTERED
      )
    )
  }

  ownerSummary.push(
    _getSummaryListRow('Your email', applicantContactDetails.emailAddress)
  )

  ownerSummary.push(_getSummaryListRow('Your address', applicantAddress))
}

const _getOwnerSummaryApplicantOther = async (
  ownerSummary,
  workForABusiness,
  sellingOnBehalfOf,
  capacity,
  applicantContactDetails,
  applicantAddress
) => {
  ownerSummary.push(_getSummaryListRow('Work for a business', workForABusiness))

  ownerSummary.push(_getSummaryListRow(sellingOnBehalfOf))

  ownerSummary.push(_getSummaryListRow('Capacity you’re acting', capacity))

  ownerSummary.push(
    _getSummaryListRow('Your name', applicantContactDetails.fullName)
  )

  if (workForABusiness === Options.YES) {
    ownerSummary.push(
      _getSummaryListRow(
        'Business name',
        applicantContactDetails.businessName || NOTHING_ENTERED
      )
    )
  }

  ownerSummary.push(
    _getSummaryListRow('Your email', applicantContactDetails.emailAddress)
  )

  ownerSummary.push(_getSummaryListRow('Your address', applicantAddress))
}

const _getOwnerSummaryApplicantDefault = async (
  ownerSummary,
  workForABusiness,
  sellingOnBehalfOf,
  ownerContactDetails,
  ownerAddress,
  applicantContactDetails,
  applicantAddress
) => {
  ownerSummary.push(_getSummaryListRow('Work for a business', workForABusiness))

  ownerSummary.push(
    _getSummaryListRow('Selling on behalf of', sellingOnBehalfOf)
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Owner’s name',
      ownerContactDetails.fullName || ownerContactDetails.businessName
    )
  )

  ownerSummary.push(
    _getSummaryListRow(
      'Owner’s email',
      ownerContactDetails.emailAddress || 'None given'
    )
  )

  ownerSummary.push(_getSummaryListRow('Owner’s address', ownerAddress))

  ownerSummary.push(
    _getSummaryListRow('Your name', applicantContactDetails.fullName)
  )

  if (workForABusiness === Options.YES) {
    ownerSummary.push(
      _getSummaryListRow(
        'Business name',
        applicantContactDetails.businessName || NOTHING_ENTERED
      )
    )
  }

  ownerSummary.push(
    _getSummaryListRow('Your email', applicantContactDetails.emailAddress)
  )

  ownerSummary.push(_getSummaryListRow('Your address', applicantAddress))
}

const _getPhotoSummary = async (entity, key) => {
  const uploadPhotos = []

  console.log(entity)

  for (let i = 1; i <= MAX_PHOTOS; i++) {
    const id = entity[DataVerseFieldName[`PHOTO_${i}_ID`]]
    const file = entity[DataVerseFieldName[`PHOTO_${i}`]]

    if (file) {
      uploadPhotos.push({ id, file })
    }
  }

  uploadPhotos.forEach((uploadPhoto, index) => {
    const imageFile = `data:image;base64,${uploadPhoto.file}`

    uploadPhoto.row = `<img id="photo${index}" class="govuk-!-padding-bottom-5" src=${imageFile} alt="Photo ${index +
      1}" width="200">`
  })

  return uploadPhotos.map((uploadPhoto, index) => {
    return _getSummaryListRow(
      `Photo ${index + 1}`,
      uploadPhoto.row,
      _getChangeItems(
        `${Paths.PASS_DATA_TO_PI_PHOTOS}?id=${uploadPhoto.id}&key=${key}`,
        DOWNLOAD_LINK_TEXT
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
    visuallyHiddenText
  }
]

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI}`,
    handler: handlers.get
  }
]
