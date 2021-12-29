'use strict'

// TODO GA
// const AnalyticsService = require('../services/analytics.service')
const ODataService = require('../services/odata.service')
const RedisService = require('../services/redis.service')
const PaymentService = require('../services/payment.service')
const RedisHelper = require('../services/redis-helper.service')

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
  CapacityLookup,
  AlreadyCertifiedLookup
} = require('../services/dataverse-choice-lookups')

const handlers = {
  get: async (request, h) => {
    const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)

    const payment = await PaymentService.lookupPayment(paymentId)

    const itemType = await RedisHelper.getItemType(request)
    const isSection2 = await RedisHelper.isSection2(request, itemType)

    const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

    if (payment.state.status === PaymentResult.SUCCESS) {
      if (isAlreadyCertified) {
        _resellRecord(request)
      } else {
        const entity = await _createRecord(request, itemType, isSection2)

        await _updateRecord(request, entity, isSection2)

        if (isSection2) {
          await _updateRecordAttachments(request, entity)
        }
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
  const updateBody = await _getAdditionalPhotos(request)
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

const _resellRecord = async request => {
  const updateBody = await _getNewOwnerDetails(request)

  Object.assign(updateBody, await _getPreviousSubmission(request))

  return ODataService.updateRecord(
    updateBody[DataVerseFieldName.SECTION_2_CASE_ID],
    updateBody
  )
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SAVE_RECORD}`,
    handler: handlers.get
  }
]

const _createSection2Body = async (request, itemType, itemDescription) => {
  const [targetCompletionDate, submissionReference, whyRmi] = await Promise.all(
    [
      RedisService.get(request, RedisKeys.TARGET_COMPLETION_DATE),
      RedisService.get(request, RedisKeys.SUBMISSION_REFERENCE),
      RedisService.get(request, RedisKeys.WHY_IS_ITEM_RMI)
    ]
  )

  return {
    ...(await _getCommonFields(request, itemDescription)),
    [DataVerseFieldName.TARGET_COMPLETION_DATE]: targetCompletionDate,
    [DataVerseFieldName.NAME]: submissionReference,
    [DataVerseFieldName.EXEMPTION_CATEGORY]: _getExemptionCategoryCode(
      itemType
    ),
    [DataVerseFieldName.WHERE_IT_WAS_MADE]: itemDescription.whereMade,
    [DataVerseFieldName.WHEN_IT_WAS_MADE]: itemDescription.whenMade,
    [DataVerseFieldName.WHY_OUTSTANDINLY_VALUABLE]: whyRmi,
    ...(await _getPreviousSubmission(request))
  }
}

const _createSection10Body = async (request, itemType, itemDescription) => {
  const [ivoryVolume, submissionReference, ivoryIntegral] = await Promise.all([
    RedisService.get(request, RedisKeys.IVORY_VOLUME),
    RedisService.get(request, RedisKeys.SUBMISSION_REFERENCE),
    RedisService.get(request, RedisKeys.IVORY_INTEGRAL)
  ])

  return {
    ...(await _getCommonFields(request, itemDescription)),
    [DataVerseFieldName.SUBMISSION_REFERENCE]: submissionReference,
    [DataVerseFieldName.EXEMPTION_TYPE]: _getExemptionCategoryCode(itemType),
    [DataVerseFieldName.WHY_IVORY_EXEMPT]:
      ivoryVolume && ivoryVolume.ivoryVolume
        ? _getIvoryVolumeReasonCode(ivoryVolume.ivoryVolume)
        : null,
    [DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON]: ivoryVolume
      ? ivoryVolume.otherReason
      : null,
    [DataVerseFieldName.WHY_IVORY_INTEGRAL]:
      itemType === ItemType.TEN_PERCENT
        ? _getIvoryIntegralReasonCode(ivoryIntegral)
        : null
  }
}

const _getCommonFields = async (request, itemDescription) => {
  const now = new Date().toISOString()

  const [
    ivoryAge,
    submissionDate,
    paymentId,
    intentionForItem
  ] = await Promise.all([
    RedisService.get(request, RedisKeys.IVORY_AGE),
    RedisService.get(request, RedisKeys.SUBMISSION_DATE),
    RedisService.get(request, RedisKeys.PAYMENT_ID),
    RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM)
  ])

  return {
    createdon: now,
    [DataVerseFieldName.DATE_STATUS_APPLIED]: now,
    statuscode: 1,
    statecode: 0,
    [DataVerseFieldName.STATUS]: Status.Logged,
    [DataVerseFieldName.SUBMISSION_DATE]: submissionDate,
    [DataVerseFieldName.PAYMENT_REFERENCE]: paymentId,
    [DataVerseFieldName.WHY_AGE_EXEMPT]: _getAgeExemptionReasonCodes(ivoryAge),
    [DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON]: ivoryAge
      ? ivoryAge.otherReason
      : null,
    [DataVerseFieldName.WHERE_IS_THE_IVORY]: itemDescription.whereIsIvory,
    [DataVerseFieldName.ITEM_SUMMARY]: itemDescription.whatIsItem,
    [DataVerseFieldName.UNIQUE_FEATURES]:
      itemDescription.distinguishingFeatures,
    [DataVerseFieldName.INTENTION]: _getIntentionCategoryCode(intentionForItem),
    ...(await _getInitialPhoto(request)),
    ...(await _getOwnerAndApplicantDetails(request))
  }
}

const _getOwnerAndApplicantDetails = async request => {
  const [
    isOwnedByApplicant,
    ownerContactDetails,
    applicantContactDetails,
    ownerAddress,
    ownerAddressInternational,
    applicantAddress,
    applicantAddressInternational,
    sellingOnBehalfOf,
    capacityResponse,
    workForABusiness
  ] = await Promise.all([
    RedisHelper.isOwnedByApplicant(request),
    RedisService.get(request, RedisKeys.OWNER_CONTACT_DETAILS),
    RedisService.get(request, RedisKeys.APPLICANT_CONTACT_DETAILS),
    RedisService.get(request, RedisKeys.OWNER_ADDRESS),
    RedisService.get(request, RedisKeys.OWNER_ADDRESS_INTERNATIONAL),
    RedisService.get(request, RedisKeys.APPLICANT_ADDRESS),
    RedisService.get(request, RedisKeys.APPLICANT_ADDRESS_INTERNATIONAL),
    RedisService.get(request, RedisKeys.SELLING_ON_BEHALF_OF),
    RedisService.get(request, RedisKeys.WHAT_CAPACITY),
    RedisService.get(request, RedisKeys.WORK_FOR_A_BUSINESS)
  ])

  const capacity = capacityResponse ? capacityResponse.whatCapacity : null
  const capacityOther = capacityResponse ? capacityResponse.otherCapacity : null

  return {
    [DataVerseFieldName.OWNED_BY_APPLICANT]: isOwnedByApplicant,
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

    [DataVerseFieldName.WORK_FOR_A_BUSINESS]: workForABusiness === Options.YES,

    [DataVerseFieldName.SELLING_ON_BEHALF_OF]: _getSellingOnBehalfOfCode(
      sellingOnBehalfOf
    ),

    [DataVerseFieldName.CAPACITY]: _getCapacityCode(capacity),
    [DataVerseFieldName.CAPACITY_OTHER]: capacityOther
  }
}

const _getPreviousSubmission = async request => {
  const [
    alreadyCertified,
    revokedCertificateNumber,
    appliedBefore,
    previousApplicationNumber
  ] = await Promise.all([
    RedisService.get(request, RedisKeys.ALREADY_CERTIFIED),
    RedisService.get(request, RedisKeys.REVOKED_CERTIFICATE),
    RedisService.get(request, RedisKeys.APPLIED_BEFORE),
    RedisService.get(request, RedisKeys.PREVIOUS_APPLICATION_NUMBER)
  ])

  const alreadyCertifiedCode = alreadyCertified
    ? _getAlreadyCertifiedCode(alreadyCertified.alreadyCertified)
    : null

  return {
    [DataVerseFieldName.ALREADY_HAS_CERTIFICATE]: alreadyCertifiedCode,
    [DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER]: revokedCertificateNumber,
    [DataVerseFieldName.APPLIED_BEFORE]: appliedBefore === Options.YES,
    [DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER]: previousApplicationNumber
  }
}

const _getNewOwnerDetails = async request => {
  const existingRecord = await RedisService.get(
    request,
    RedisKeys.ALREADY_CERTIFIED_EXISTING_RECORD
  )

  const ownerAndApplicantDetails = await _getOwnerAndApplicantDetails(request)

  return {
    [DataVerseFieldName.SECTION_2_CASE_ID]:
      existingRecord[DataVerseFieldName.SECTION_2_CASE_ID],

    // Owner details

    [DataVerseFieldName.PREVIOUS_OWNER_NAME]:
      existingRecord[DataVerseFieldName.OWNER_NAME],

    [DataVerseFieldName.PREVIOUS_OWNER_EMAIL]:
      existingRecord[DataVerseFieldName.OWNER_EMAIL],

    [DataVerseFieldName.PREVIOUS_OWNER_ADDRESS]:
      existingRecord[DataVerseFieldName.OWNER_ADDRESS],

    [DataVerseFieldName.PREVIOUS_OWNER_POSTCODE]:
      existingRecord[DataVerseFieldName.OWNER_POSTCODE],

    // Applicant details

    [DataVerseFieldName.PREVIOUS_APPLICANT_NAME]:
      existingRecord[DataVerseFieldName.APPLICANT_NAME],

    [DataVerseFieldName.PREVIOUS_APPLICANT_EMAIL]:
      existingRecord[DataVerseFieldName.APPLICANT_EMAIL],

    [DataVerseFieldName.PREVIOUS_APPLICANT_ADDRESS]:
      existingRecord[DataVerseFieldName.APPLICANT_ADDRESS],

    [DataVerseFieldName.PREVIOUS_APPLICANT_POSTCODE]:
      existingRecord[DataVerseFieldName.APPLICANT_POSTCODE],

    // Third party ownership details

    [DataVerseFieldName.PREVIOUS_OWNED_BY_APPLICANT]:
      existingRecord[DataVerseFieldName.OWNED_BY_APPLICANT],

    [DataVerseFieldName.PREVIOUS_WORK_FOR_A_BUSINESS]:
      existingRecord[DataVerseFieldName.WORK_FOR_A_BUSINESS],

    [DataVerseFieldName.PREVIOUS_SELLING_ON_BEHALF_OF]:
      existingRecord[DataVerseFieldName.SELLING_ON_BEHALF_OF],

    [DataVerseFieldName.PREVIOUS_CAPACITY]:
      existingRecord[DataVerseFieldName.CAPACITY],

    [DataVerseFieldName.PREVIOUS_CAPACITY_OTHER]:
      existingRecord[DataVerseFieldName.CAPACITY_OTHER],

    ...ownerAndApplicantDetails
  }
}

// Removes the postcode from an address
const _formatAddress = (address, isInternationalAddress) => {
  if (isInternationalAddress) {
    return address
  }

  let formattedAddress
  if (address) {
    const postcodeIndex = address.lastIndexOf(', ')
    if (postcodeIndex) {
      formattedAddress = address.substring(postcodeIndex, -1)
    }
  }

  const firstCommaReplacementToken = '###'
  formattedAddress = formattedAddress.replace(', ', firstCommaReplacementToken)
  formattedAddress = formattedAddress.replaceAll(', ', '\n')
  formattedAddress = formattedAddress.replace(firstCommaReplacementToken, ', ')

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

const _getInitialPhoto = async request => {
  const photos = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  return {
    [DataVerseFieldName.PHOTO_1]:
      photos && photos.files && photos.files.length ? photos.fileData[0] : null
  }
}

const _getAdditionalPhotos = async request => {
  const photos = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  const additionalPhotos = {}
  if (photos && photos.files && photos.files.length > 1) {
    for (let index = 2; index <= photos.fileData.length; index++) {
      additionalPhotos[`cre2c_photo${index}`] = photos.fileData[index - 1]
    }
  }

  return additionalPhotos
}

const _getAlreadyCertifiedCode = value => AlreadyCertifiedLookup[value]

const _getExemptionCategoryCode = value => ExemptionTypeLookup[value]

const _getAgeExemptionReasonCodes = ivoryAgeReasons =>
  ivoryAgeReasons && ivoryAgeReasons.ivoryAge
    ? ivoryAgeReasons.ivoryAge
        .map(ivoryAgeReason => AgeExemptionReasonLookup[ivoryAgeReason])
        .join(',')
    : null

const _getIntentionCategoryCode = value => IntentionLookup[value]

const _getIvoryVolumeReasonCode = value => IvoryVolumeLookup[value]

const _getIvoryIntegralReasonCode = value => IvoryIntegralLookup[value]

const _getCapacityCode = value => CapacityLookup[value]

const _getSellingOnBehalfOfCode = value => SellingOnBehalfOfLookup[value]
