'use strict'

const { Paths, RedisKeys, ItemType } = require('../utils/constants')
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

const handlers = {
  get: async (request, h) => {
    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const isSection2 = itemType === ItemType.HIGH_VALUE

    const entity = await _createRecord(request, itemType, isSection2)

    await _updateRecord(request, entity, isSection2)

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
    ? entity.cre2c_ivorysection2caseid
    : entity.cre2c_ivorysection10caseid

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
    cre2c_targetcompletiondate: await RedisService.get(
      request,
      RedisKeys.TARGET_COMPLETION_DATE
    ),
    cre2c_name: await RedisService.get(request, RedisKeys.SUBMISSION_REFERENCE),
    cre2c_exemptioncategory: _getExemptionCategoryCode(itemType),
    cre2c_whereitwasmade: itemDescription.whereMade,
    cre2c_whenitwasmade: itemDescription.whenMade,
    cre2c_whyoutstandinglyvaluable: await RedisService.get(
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
    cre2c_submissionreference: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_REFERENCE
    ),
    cre2c_exemptiontype: _getExemptionCategoryCode(itemType),
    cre2c_whyivoryexempt: ivoryVolume
      ? _getIvoryVolumeReasonCode(ivoryVolume.ivoryVolume)
      : null,
    cre2c_whyivoryexemptotherreason: ivoryVolume
      ? ivoryVolume.otherReason
      : null,
    cre2c_whyivoryintegral:
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
    cre2c_datestatusapplied: now,
    statuscode: 1,
    statecode: 0,
    cre2c_status: Status.New,
    cre2c_submissiondate: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_DATE
    ),
    cre2c_paymentreference: await RedisService.get(
      request,
      RedisKeys.PAYMENT_ID
    ),
    cre2c_whyageexempt: _getAgeExemptionReasonCodes(ivoryAge),
    cre2c_whyageexemptotherreason: ivoryAge.otherReason,
    cre2c_wherestheivory: itemDescription.whereIsIvory,
    cre2c_itemsummary: itemDescription.whatIsItem,
    cre2c_uniquefeatures: itemDescription.uniqueFeatures,
    cre2c_intention: _getIntentionCategoryCode(
      await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM)
    ),
    ...(await _addInitialPhoto(request)),
    ...(await _addOwnerAndApplicantDetails(request))
  }

  return commonFields
}

const _addOwnerAndApplicantDetails = async (request, body) => {
  return {
    cre2c_ownername: await RedisService.get(request, RedisKeys.OWNER_NAME),
    cre2c_owneremail: await RedisService.get(
      request,
      RedisKeys.OWNER_EMAIL_ADDRESS
    ),
    cre2c_owneraddress: await RedisService.get(
      request,
      RedisKeys.OWNER_ADDRESS
    ),
    cre2c_applicantname: await RedisService.get(
      request,
      RedisKeys.APPLICANT_NAME
    ),
    cre2c_applicantemail: await RedisService.get(
      request,
      RedisKeys.APPLICANT_EMAIL_ADDRESS
    ),
    cre2c_applicantaddress: await RedisService.get(
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
    cre2c_photo1:
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
    cre2c_supportingevidence1: null,
    cre2c_supportingevidence1_name: null
  }
}

const _getExemptionCategoryCode = itemType => {
  return ExemptionTypeLookup[itemType]
}

const _getAgeExemptionReasonCodes = ivoryAgeReasons => {
  const ageExemptionReasonCodes = ivoryAgeReasons.ivoryAge
    .map(ivoryAgeReason => AgeExemptionReasonLookup[ivoryAgeReason])
    .join(',')

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
