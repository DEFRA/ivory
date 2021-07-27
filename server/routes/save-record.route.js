'use strict'

const {
  AgeExemptionReasons,
  Paths,
  RedisKeys,
  ItemType,
  Intention
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

const ExemptionType = {
  MusicalInstrument: 881990000,
  LessThan10pc: 881990001,
  PortraitMiniature: 881990002,
  SellingToAMuseum: 881990003,
  RareAndMostImportant: 881990004
}

const ExemptionTypeLookup = {
  [ItemType.MUSICAL]: ExemptionType.MusicalInstrument,
  [ItemType.TEN_PERCENT]: ExemptionType.LessThan10pc,
  [ItemType.MINIATURE]: ExemptionType.PortraitMiniature,
  [ItemType.MUSEUM]: ExemptionType.SellingToAMuseum,
  [ItemType.HIGH_VALUE]: ExemptionType.RareAndMostImportant
}

const IntentionType = {
  SellIt: 881990000,
  HireItOut: 881990001,
  NotSure: 881990002
}

const IntentionLookup = {
  [Intention.SELL]: IntentionType.SellIt,
  [Intention.HIRE]: IntentionType.HireItOut,
  [Intention.NOT_SURE_YET]: IntentionType.NotSure
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
      ? await _createSection2Body(request)
      : await _createSection10Body(request, itemType)

    // TODO handle errors
    ODataService.createRecord(body, isSection2)

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

const _createSection10Body = async (request, itemType) => {
  const now = new Date().toISOString()

  const itemDescription = JSON.parse(
    await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
  )

  const ivoryAge = JSON.parse(
    await RedisService.get(request, RedisKeys.IVORY_AGE)
  )

  const body = {
    createdon: now,
    cre2c_datestatusapplied: now,
    statuscode: 1,
    statecode: 0,
    cre2c_status: Status.New,

    cre2c_submissiondate: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_DATE
    ),
    cre2c_submissionreference: await RedisService.get(
      request,
      RedisKeys.SUBMISSION_REFERENCE
    ),
    cre2c_paymentreference: await RedisService.get(
      request,
      RedisKeys.PAYMENT_ID
    ),

    cre2c_exemptiontype: _getExemptionCategoryCode(itemType),
    cre2c_whyageexempt: _getAgeExemptionReasonCodes(ivoryAge),
    cre2c_whyageexemptotherreason: ivoryAge.otherReason,

    // An explanation of how the applicant knows the ivory has appropriate ivory content
    // From the "Confirm the ivory volume page" page
    // Should we have two fields? One for the radio button and one for other? Or just convert everything to a string?
    // cre2c_whyivoryexempt:

    cre2c_whyivoryintegral: WhyIvoryIntegral.NotApplicable,
    cre2c_wherestheivory: itemDescription.whereIsIvory,
    cre2c_itemsummary: itemDescription.whatIsItem,
    cre2c_uniquefeatures: itemDescription.uniqueFeatures,

    cre2c_intention: _getIntentionCategoryCode(
      await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM)
    )
  }

  await _addOwnerAndApplicantDetails(request, body)

  return body
}

const _createSection2Body = async request => {
  const now = new Date().toISOString()

  const itemDescription = JSON.parse(
    await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
  )

  const ivoryAge = JSON.parse(
    await RedisService.get(request, RedisKeys.IVORY_AGE)
  )

  const body = {
    cre2c_submissiondate: now,
    createdon: now,
    cre2c_datestatusapplied: now,
    statuscode: 1,
    statecode: 0,
    cre2c_status: Status.New,

    cre2c_name: await RedisService.get(request, RedisKeys.SUBMISSION_REFERENCE),
    cre2c_paymentreference: await RedisService.get(
      request,
      RedisKeys.PAYMENT_ID
    ),

    cre2c_exemptioncategory: ExemptionType.RareAndMostImportant,
    cre2c_whyageexempt: _getAgeExemptionReasonCodes(ivoryAge),
    cre2c_whyageexemptotherreason: ivoryAge.otherReason,

    // TBC
    // cre2c_whyivoryexempt:,

    cre2c_wherestheivory: itemDescription.whereIsIvory,
    cre2c_itemsummary: itemDescription.whatIsItem,
    cre2c_uniquefeatures: itemDescription.uniqueFeatures,
    cre2c_whereitwasmade: itemDescription.whereMade,
    cre2c_whenitwasmade: itemDescription.whenMade,

    // TODO
    cre2c_supportingevidence1: null,
    cre2c_ivoryvolumeproof: null,
    cre2c_supportingevidence1_name: null,
    // //

    cre2c_whyoutstandinglyvaluable: await RedisService.get(
      request,
      RedisKeys.WHY_IS_ITEM_RMI
    ),

    cre2c_intention: _getIntentionCategoryCode(
      await RedisService.get(request, RedisKeys.INTENTION_FOR_ITEM)
    )

    // TODO: Photo 1
    // cre2c_photo1id: 'fad3a2e7-bdeb-eb11-bacb-00224841ee65',
    // cre2c_photo1_timestamp: 637626454535927942,
    // cre2c_photo1: 'BITS adfkhasdfkhasfkjhaf jlahksdfkajs dhfa',
    // cre2c_photo1_url:
    // '/Image/download.aspx?Entity=cre2c_ivorysection2case&Attribute=cre2c_photo1&Id=cd353ad0-bdeb-eb11-bacb-00224841ee65&Timestamp=637626454535927942',

    // TODO confirm these are not needed
    // cre2c_assessmentsupportingevidence_name: 'S2 Institute Pro-forma V2.docx',
    // cre2c_instituteemail: 'PI3@museum.com',
    // cre2c_certificate: null,
    // cre2c_certificatenumber: null,
    // cre2c_assessmentsummary:
    //   'It is of my view that this item does meet the criteria for a RMI item. Summary: there are many of these on the market',
    // cre2c_nameofassessor: 'Joe assesor',
    // cre2c_daterecommendationreceived: '2021-08-02T11:00:00Z',
    // cre2c_nameofinstitute: 'P3',
    // cre2c_assessoremail: 'Joeassesor@j.com',
    // cre2c_certificate_name: null,
    // cre2c_recommendation: null,
    // cre2c_assessmentsupportingevidence:
    //   'a70c594f-beeb-eb11-bacb-00224841ee65',
    // cre2c_targetcompletiondate: '2021-08-02T00:00:00Z',
  }

  await _addOwnerAndApplicantDetails(request, body)

  return body
}

const _addOwnerAndApplicantDetails = async (request, body) => {
  body.cre2c_ownername = await RedisService.get(request, RedisKeys.OWNER_NAME)
  body.cre2c_owneremail = await RedisService.get(
    request,
    RedisKeys.OWNER_EMAIL_ADDRESS
  )
  body.cre2c_owneraddress = await RedisService.get(
    request,
    RedisKeys.OWNER_ADDRESS
  )

  body.cre2c_applicantname = await RedisService.get(
    request,
    RedisKeys.APPLICANT_NAME
  )
  body.cre2c_applicantemail = await RedisService.get(
    request,
    RedisKeys.APPLICANT_EMAIL_ADDRESS
  )
  body.cre2c_applicantaddress = await RedisService.get(
    request,
    RedisKeys.APPLICANT_ADDRESS
  )
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

// const _recordCreationFailed = state => {
//   return state && state.status && state.status === PaymentResult.FAILED
// }
