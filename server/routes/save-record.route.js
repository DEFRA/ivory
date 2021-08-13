'use strict'

const { Paths, RedisKeys, ItemType, PaymentResult } = require('../utils/constants')
const { DataVerseFieldName } = require('../utils/constants')
const {
  AgeExemptionReasonLookup,
  ExemptionTypeLookup,
  IntentionLookup,
  IvoryIntegralLookup,
  IvoryVolumeLookup,
  Status
} = require('../services/dataverse-choice-lookups')
const ODataService = require('../services/odata.service')
const RedisService = require('../services/redis.service')
const PaymentService = require('../services/payment.service')

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
    }
    return h.redirect(Paths.SERVICE_COMPLETE)
  }
}

const _createRecord = async (request, itemType, isSection2) => {
  const itemDescription = JSON.parse(
    await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
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

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SAVE_RECORD}`,
    handler: handlers.get
  }
]

const _createSection2Body = async (request, itemType, itemDescription) => {
  const body = {
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
    ),
    ...(await _addSupportingInformation(request))
  }

  return body
}

const _createSection10Body = async (request, itemType, itemDescription) => {
  const ivoryVolumeStringified = await RedisService.get(
    request,
    RedisKeys.IVORY_VOLUME
  )

  const ivoryVolume = ivoryVolumeStringified
    ? JSON.parse(ivoryVolumeStringified)
    : null

  const body = {
    ...(await _getCommonFields(request, itemDescription)),
    [DataVerseFieldName.SUBMISSION_REFERENCE]: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_REFERENCE
    ),
    [DataVerseFieldName.EXEMPTION_TYPE]: _getExemptionCategoryCode(itemType),
    [DataVerseFieldName.WHY_IVORY_EXEMPT]: ivoryVolume
      ? _getIvoryVolumeReasonCode(ivoryVolume.ivoryVolume)
      : null,
    [DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON]: ivoryVolume
      ? ivoryVolume.otherReason
      : null,
    [DataVerseFieldName.WHY_IVORY_INTEGRAL]:
      itemType === ItemType.TEN_PERCENT
        ? _getIvoryIntegralReasonCode(
            await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)
          )
        : null
  }

  return body
}

const _getCommonFields = async (request, itemDescription) => {
  const now = new Date().toISOString()

  const ivoryAge = JSON.parse(
    await RedisService.get(request, RedisKeys.IVORY_AGE)
  )

  const commonFields = {
    createdon: now,
    [DataVerseFieldName.DATE_STATUS_APPLIED]: now,
    statuscode: 1,
    statecode: 0,
    [DataVerseFieldName.STATUS]: Status.New,
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
      : '',
    [DataVerseFieldName.WHERE_IS_THE_IVORY]: itemDescription.whereIsIvory,
    [DataVerseFieldName.ITEM_SUMMARY]: itemDescription.whatIsItem,
    [DataVerseFieldName.UNIQUE_FEATURES]: itemDescription.uniqueFeatures,
    [DataVerseFieldName.INTENTION]: _getIntentionCategoryCode(
      await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM)
    ),
    ...(await _addInitialPhoto(request)),
    ...(await _addOwnerAndApplicantDetails(request))
  }

  return commonFields
}

const _addOwnerAndApplicantDetails = async (request, body) => {
  return {
    [DataVerseFieldName.OWNER_NAME]: await RedisService.get(
      request,
      RedisKeys.OWNER_NAME
    ),
    [DataVerseFieldName.OWNER_EMAIL]: await RedisService.get(
      request,
      RedisKeys.OWNER_EMAIL_ADDRESS
    ),
    [DataVerseFieldName.OWNER_ADDRESS]: await RedisService.get(
      request,
      RedisKeys.OWNER_ADDRESS
    ),
    [DataVerseFieldName.APPLICANT_NAME]: await RedisService.get(
      request,
      RedisKeys.APPLICANT_NAME
    ),
    [DataVerseFieldName.APPLICANT_EMAIL]: await RedisService.get(
      request,
      RedisKeys.APPLICANT_EMAIL_ADDRESS
    ),
    [DataVerseFieldName.APPLICANT_ADDRESS]: await RedisService.get(
      request,
      RedisKeys.APPLICANT_ADDRESS
    )
  }
}

const _addInitialPhoto = async request => {
  const photos = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_PHOTOS)
  )

  return {
    [DataVerseFieldName.PHOTO_1]:
      photos && photos.files && photos.files.length ? photos.fileData[0] : null
  }
}

const _addAdditionalPhotos = async request => {
  const photos = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_PHOTOS)
  )

  const additionalPhotos = {}
  if (photos && photos.files && photos.files.length > 1) {
    for (let index = 2; index <= photos.fileData.length; index++) {
      additionalPhotos[`cre2c_photo${index}`] = photos.fileData[index - 1]
    }
  }

  return additionalPhotos
}

// TODO - IVORY-367 - These fields will be added
const _addSupportingInformation = async request => {
  // const supportingInformation = JSON.parse(
  //   await RedisService.get(request, RedisKeys.SUPPORTING_INFORMATION)
  // )

  return {
    [DataVerseFieldName.SUPPORTING_EVIDENCE_1]: null,
    [DataVerseFieldName.SUPPORTING_EVIDENCE_1_NAME]: null
  }
}

const _getExemptionCategoryCode = itemType => {
  return ExemptionTypeLookup[itemType]
}

const _getAgeExemptionReasonCodes = ivoryAgeReasons => {
  const ageExemptionReasonCodes =
    ivoryAgeReasons && ivoryAgeReasons.ivoryAge
      ? ivoryAgeReasons.ivoryAge
          .map(ivoryAgeReason => AgeExemptionReasonLookup[ivoryAgeReason])
          .join(',')
      : ''

  return ageExemptionReasonCodes
}

const _getIntentionCategoryCode = intention => {
  return IntentionLookup[intention]
}

const _getIvoryVolumeReasonCode = ivoryVolumeReason => {
  return IvoryVolumeLookup[ivoryVolumeReason]
}

const _getIvoryIntegralReasonCode = ivoryIntegralReason => {
  return IvoryIntegralLookup[ivoryIntegralReason]
}
