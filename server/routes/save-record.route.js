'use strict'

// TODO GA
// const AnalyticsService = require('../services/analytics.service')
const ODataService = require('../services/odata.service')
const RedisService = require('../services/redis.service')
const PaymentService = require('../services/payment.service')

const {
  ItemType,
  Options,
  Paths,
  PaymentResult,
  RedisKeys
} = require('../utils/constants')
const { DataVerseFieldName } = require('../utils/constants')
const {
  AgeExemptionReasonLookup,
  ExemptionTypeLookup,
  IntentionLookup,
  IvoryIntegralLookup,
  IvoryVolumeLookup,
  Status,
  SellingOnBehalfOfLookup,
  CapacityLookup
} = require('../services/dataverse-choice-lookups')

const handlers = {
  get: async (request, h) => {
    const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)

    const payment = await PaymentService.lookupPayment(paymentId)

    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const isSection2 = itemType === ItemType.HIGH_VALUE

    if (payment.state.status === PaymentResult.SUCCESS) {
      const entity = await _createRecord(request, itemType, isSection2)

      await _updateRecord(request, entity, isSection2)

      if (isSection2) {
        await _updateRecordAttachments(request, entity)
      }
    }
    return h.redirect(Paths.SERVICE_COMPLETE)
  }
}

const _createRecord = async (request, itemType, isSection2) => {
  const itemDescription = await RedisService.get(
    request,
    RedisKeys.DESCRIBE_THE_ITEM
  )

  const body = isSection2
    ? await _createSection2Body(request, itemType, itemDescription)
    : await _createSection10Body(request, itemType, itemDescription)

  return ODataService.createRecord(body, isSection2)
}

const _updateRecord = async (request, entity, isSection2) => {
  const updateBody = await _addAdditionalPhotos(request)
  const id = isSection2
    ? entity[DataVerseFieldName.SECTION_2_CASE_ID]
    : entity[DataVerseFieldName.SECTION_10_CASE_ID]

  return ODataService.updateRecord(id, updateBody, isSection2)
}

const _updateRecordAttachments = async (request, entity) => {
  const supportingInformation = await RedisService.get(
    request,
    RedisKeys.UPLOAD_DOCUMENT
  )

  if (supportingInformation) {
    ODataService.updateRecordAttachments(
      entity[DataVerseFieldName.SECTION_2_CASE_ID],
      supportingInformation
    )
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SAVE_RECORD}`,
    handler: handlers.get
  }
]

const _createSection2Body = async (request, itemType, itemDescription) => {
  return {
    ...(await _getCommonFields(request, itemDescription)),
    [DataVerseFieldName.TARGET_COMPLETION_DATE]: await RedisService.get(
      request,
      RedisKeys.TARGET_COMPLETION_DATE
    ),
    [DataVerseFieldName.NAME]: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_REFERENCE
    ),
    [DataVerseFieldName.EXEMPTION_CATEGORY]: _getExemptionCategoryCode(
      itemType
    ),
    [DataVerseFieldName.WHERE_IT_WAS_MADE]: itemDescription.whereMade,
    [DataVerseFieldName.WHEN_IT_WAS_MADE]: itemDescription.whenMade,
    [DataVerseFieldName.WHY_OUTSTANDINLY_VALUABLE]: await RedisService.get(
      request,
      RedisKeys.WHY_IS_ITEM_RMI
    )
  }
}

const _createSection10Body = async (request, itemType, itemDescription) => {
  const ivoryVolume = await RedisService.get(request, RedisKeys.IVORY_VOLUME)

  return {
    ...(await _getCommonFields(request, itemDescription)),
    [DataVerseFieldName.SUBMISSION_REFERENCE]: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_REFERENCE
    ),
    [DataVerseFieldName.EXEMPTION_TYPE]: _getExemptionCategoryCode(itemType),
    [DataVerseFieldName.WHY_IVORY_EXEMPT]: ivoryVolume.ivoryVolume
      ? _getIvoryVolumeReasonCode(ivoryVolume.ivoryVolume)
      : null,
    [DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON]: ivoryVolume.otherReason,
    [DataVerseFieldName.WHY_IVORY_INTEGRAL]:
      itemType === ItemType.TEN_PERCENT
        ? _getIvoryIntegralReasonCode(
            await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)
          )
        : null
  }
}

const _getCommonFields = async (request, itemDescription) => {
  const now = new Date().toISOString()

  const ivoryAge = await RedisService.get(request, RedisKeys.IVORY_AGE)

  return {
    createdon: now,
    [DataVerseFieldName.DATE_STATUS_APPLIED]: now,
    statuscode: 1,
    statecode: 0,
    [DataVerseFieldName.STATUS]: Status.Logged,
    [DataVerseFieldName.SUBMISSION_DATE]: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_DATE
    ),
    [DataVerseFieldName.PAYMENT_REFERENCE]: await RedisService.get(
      request,
      RedisKeys.PAYMENT_ID
    ),
    [DataVerseFieldName.WHY_AGE_EXEMPT]: _getAgeExemptionReasonCodes(ivoryAge),
    [DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON]: ivoryAge
      ? ivoryAge.otherReason
      : null,
    [DataVerseFieldName.WHERE_IS_THE_IVORY]: itemDescription.whereIsIvory,
    [DataVerseFieldName.ITEM_SUMMARY]: itemDescription.whatIsItem,
    [DataVerseFieldName.UNIQUE_FEATURES]: itemDescription.uniqueFeatures,
    [DataVerseFieldName.INTENTION]: _getIntentionCategoryCode(
      await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM)
    ),
    ...(await _addInitialPhoto(request)),
    ...(await _addOwnerAndApplicantDetails(request))
  }
}

const _addOwnerAndApplicantDetails = async request => {
  const ownedByApplicant =
    (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
    Options.YES

  const ownerContactDetails = await RedisService.get(
    request,
    RedisKeys.OWNER_CONTACT_DETAILS
  )

  const applicantContactDetails = await RedisService.get(
    request,
    RedisKeys.APPLICANT_CONTACT_DETAILS
  )

  const ownerAddress = await RedisService.get(request, RedisKeys.OWNER_ADDRESS)
  const ownerAddressInternational =
    (await RedisService.get(request, RedisKeys.OWNER_ADDRESS_INTERNATIONAL)) ===
    'true'
  const applicantAddress = await RedisService.get(
    request,
    RedisKeys.APPLICANT_ADDRESS
  )
  const applicantAddressInternational =
    (await RedisService.get(
      request,
      RedisKeys.APPLICANT_ADDRESS_INTERNATIONAL
    )) === 'true'

  const sellingOnBehalfOf = await RedisService.get(
    request,
    RedisKeys.SELLING_ON_BEHALF_OF
  )

  const capacityResponse = await RedisService.get(
    request,
    RedisKeys.WHAT_CAPACITY
  )

  const capacity = capacityResponse ? capacityResponse.whatCapacity : null
  const capacityOther = capacityResponse ? capacityResponse.otherCapacity : null

  return {
    [DataVerseFieldName.OWNED_BY_APPLICANT]: ownedByApplicant,
    [DataVerseFieldName.OWNER_NAME]: ownerContactDetails
      ? ownerContactDetails.fullName || ownerContactDetails.businessName
      : null,
    [DataVerseFieldName.OWNER_EMAIL]: ownerContactDetails
      ? ownerContactDetails.emailAddress
      : null,
    [DataVerseFieldName.OWNER_ADDRESS]: _formatAddress(
      ownerAddress,
      ownerAddressInternational
    ),
    [DataVerseFieldName.OWNER_POSTCODE]: _getPostcode(
      ownerAddress,
      ownerAddressInternational
    ),
    [DataVerseFieldName.APPLICANT_NAME]: applicantContactDetails.fullName,
    [DataVerseFieldName.APPLICANT_EMAIL]: applicantContactDetails.emailAddress,
    [DataVerseFieldName.APPLICANT_ADDRESS]: _formatAddress(
      applicantAddress,
      applicantAddressInternational
    ),
    [DataVerseFieldName.APPLICANT_POSTCODE]: _getPostcode(
      applicantAddress,
      applicantAddressInternational
    ),

    [DataVerseFieldName.WORK_FOR_A_BUSINESS]:
      (await RedisService.get(request, RedisKeys.WORK_FOR_A_BUSINESS)) ===
      Options.YES,

    [DataVerseFieldName.SELLING_ON_BEHALF_OF]: _getSellingOnBehalfOfCode(
      sellingOnBehalfOf
    ),

    [DataVerseFieldName.CAPACITY]: _getCapacityCode(capacity),
    [DataVerseFieldName.CAPACITY_OTHER]: capacityOther
  }
}

// Removes the postcode from an address
const _formatAddress = (address, isInternationalAddress) => {
  if (isInternationalAddress) {
    return address
  }

  let formattedAddress
  if (address && !isInternationalAddress) {
    const postcodeIndex = address.lastIndexOf(', ')
    if (postcodeIndex) {
      formattedAddress = address.substring(postcodeIndex, -1)
    }
  }

  return formattedAddress
}

// Returns the postcode from an address
const _getPostcode = (address, isInternationalAddress) => {
  let postcode
  if (address && !isInternationalAddress) {
    const postcodeIndex = address.lastIndexOf(', ')
    if (postcodeIndex) {
      postcode = address.slice(postcodeIndex + 2)
    }
  }

  return postcode
}

const _addInitialPhoto = async request => {
  const photos = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  return {
    [DataVerseFieldName.PHOTO_1]:
      photos && photos.files && photos.files.length ? photos.fileData[0] : null
  }
}

const _addAdditionalPhotos = async request => {
  const photos = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  const additionalPhotos = {}
  if (photos && photos.files && photos.files.length > 1) {
    for (let index = 2; index <= photos.fileData.length; index++) {
      additionalPhotos[`cre2c_photo${index}`] = photos.fileData[index - 1]
    }
  }

  return additionalPhotos
}

const _getExemptionCategoryCode = itemType => ExemptionTypeLookup[itemType]

const _getAgeExemptionReasonCodes = ivoryAgeReasons =>
  ivoryAgeReasons && ivoryAgeReasons.ivoryAge
    ? ivoryAgeReasons.ivoryAge
        .map(ivoryAgeReason => AgeExemptionReasonLookup[ivoryAgeReason])
        .join(',')
    : null

const _getIntentionCategoryCode = intention => IntentionLookup[intention]

const _getIvoryVolumeReasonCode = ivoryVolumeReason =>
  IvoryVolumeLookup[ivoryVolumeReason]

const _getIvoryIntegralReasonCode = ivoryIntegralReason =>
  IvoryIntegralLookup[ivoryIntegralReason]

const _getCapacityCode = capacity => CapacityLookup[capacity]

const _getSellingOnBehalfOfCode = sellingOnBehalfOf =>
  SellingOnBehalfOfLookup[sellingOnBehalfOf]
