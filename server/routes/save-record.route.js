'use strict'

const {
  AgeExemptionReasons,
  Paths,
  RedisKeys,
  ItemType,
  Intention,
  IvoryIntegralReasons,
  IvoryVolumeReasons
} = require('../utils/constants')
const ODataService = require('../services/odata.service')
const RedisService = require('../services/redis.service')

const AgeExemptionReasonLookup = {
  [AgeExemptionReasons.STAMP_OR_SERIAL]: 881990000,
  [AgeExemptionReasons.DATED_RECEIPT]: 881990001,
  [AgeExemptionReasons.DATED_PUBLICATION]: 881990002,
  [AgeExemptionReasons.BEEN_IN_FAMILY_1975]: 881990003,
  [AgeExemptionReasons.BEEN_IN_FAMILY_1947]: 881990004,
  [AgeExemptionReasons.BEEN_IN_FAMILY_1918]: 881990005,
  [AgeExemptionReasons.EXPERT_VERIFICATION]: 881990006,
  [AgeExemptionReasons.PROFESSIONAL_OPINION]: 881990007,
  [AgeExemptionReasons.CARBON_DATED]: 881990008,
  [AgeExemptionReasons.OTHER_REASON]: 881990009
}

const ExemptionTypeLookup = {
  [ItemType.MUSICAL]: 881990000,
  [ItemType.TEN_PERCENT]: 881990001,
  [ItemType.MINIATURE]: 881990002,
  [ItemType.MUSEUM]: 881990003,
  [ItemType.HIGH_VALUE]: 881990004
}

const IntentionLookup = {
  [Intention.SELL]: 881990000,
  [Intention.HIRE]: 881990001,
  [Intention.NOT_SURE_YET]: 881990002
}

const IvoryIntegralLookup = {
  [IvoryIntegralReasons.NOT_APPLICABLE]: 881990000,
  [IvoryIntegralReasons.ESSENTIAL_TO_DESIGN_OR_FUNCTION]: 881990001,
  [IvoryIntegralReasons.CANNOT_EASILY_REMOVE]: 881990002,
  [IvoryIntegralReasons.BOTH_OF_ABOVE]: 881990003
}

const IvoryVolumeLookup = {
  [IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT]: 881990000,
  [IvoryVolumeReasons.MEASURED_IT]: 881990001,
  [IvoryVolumeReasons.WRITTEN_VERIFICATION]: 881990002,
  [IvoryVolumeReasons.OTHER_REASON]: 881990003
}

const Status = {
  New: 881990000,
  InProgress: 881990001,
  RequestedMoreInformation: 881990002,
  SentToInstitute: 881990003,
  Certified: 881990004,
  Rejected: 881990005
}

const WhyIvoryIntegral = {
  NotApplicable: 881990000,
  EssentialToDesignOrFunction: 881990001,
  CannotRemoveEasily: 881990002,
  Both: 881990003
}

const handlers = {
  get: async (request, h) => {
    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const isSection2 = itemType === ItemType.HIGH_VALUE

    const body = isSection2
      ? await _createSection2Body(request, itemType)
      : await _createSection10Body(request, itemType)

    // TODO handle errors
    ODataService.createRecord(body, isSection2)

    // TODO handle errors
    // TODO upload images 2-6 if available
    // ODataService.updateRecord(body, isSection2)

    // if (_recordCreationFailed(state)) {
    return h.redirect(Paths.SERVICE_COMPLETE)
    // }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SAVE_RECORD}`,
    handler: handlers.get
  }
]

// TODO handle unhappy path
// const _recordCreationFailed = state => {
//   return state && state.status && state.status === PaymentResult.FAILED
// }

const _createSection10Body = async (request, itemType) => {
  const ivoryVolumeStringified = await RedisService.get(
    request,
    RedisKeys.IVORY_VOLUME
  )

  const ivoryVolume = ivoryVolumeStringified
    ? JSON.parse(ivoryVolumeStringified)
    : null

  const body = {
    ...(await _getCommonFields(request)),

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
        : WhyIvoryIntegral.NotApplicable
  }

  // console.log('section 10 body', body)

  return body
}

const _createSection2Body = async (request, itemType) => {
  const itemDescription = JSON.parse(
    await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
  )

  const body = {
    ...(await _getCommonFields(request)),

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

  // console.log('section 2 body', body)

  return body
}

const _getCommonFields = async request => {
  const now = new Date().toISOString()

  const ivoryAge = JSON.parse(
    await RedisService.get(request, RedisKeys.IVORY_AGE)
  )

  const itemDescription = JSON.parse(
    await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
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
    ...(await _addPhoto(request)),
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

const _addPhoto = async request => {
  const photos = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_PHOTOS)
  )

  return {
    cre2c_photo1: photos && photos.fileData ? photos.fileData[0] : null
  }
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
