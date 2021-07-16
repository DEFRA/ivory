'use strict'

const { Paths, RedisKeys, ItemType } = require('../utils/constants')
const ODataService = require('../services/odata.service')
const RedisService = require('../services/redis.service')

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

// const Intention = {
//   SellIt: 881990000,
//   HireItOut: 881990001,
//   NotSure: 881990002
// }

// const Recommendation = {
//   DoesNotQualify: 881990000,
//   RareAndMostImportant: 881990001
// }

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
    // TODO remove this
    console.log('Saving record')

    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const itemDescription = JSON.parse(
      await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
    )

    const body = {
      cre2c_submissiondate: '2021-06-28T00:00:00Z',

      cre2c_whyivoryintegral: WhyIvoryIntegral.NotApplicable,

      statuscode: 1,
      createdon: '2021-07-12T14:33:41Z',
      cre2c_wherestheivory: itemDescription.whereIsIvory,
      statecode: 0,
      cre2c_itemsummary: itemDescription.whatIsItem,
      modifiedon: '2021-07-12T14:33:41Z',
      cre2c_owneremail: await RedisService.get(
        request,
        RedisKeys.OWNER_EMAIL_ADDRESS
      ),
      versionnumber: 2742337,
      cre2c_datestatusapplied: '2021-07-12T14:32:21Z',
      cre2c_exemptiontype: await _getExemptionCategoryCode(itemType),
      cre2c_intention: 881990000,
      timezoneruleversionnumber: 4,
      cre2c_submissionreference: '000000001',
      cre2c_owneraddress: await RedisService.get(
        request,
        RedisKeys.OWNER_ADDRESS
      ),
      cre2c_whyivoryexempt: 'N/A',
      cre2c_whyageexempt:
        'It has a stamp, serial number or signature to prove its age',
      cre2c_ownername: await RedisService.get(request, RedisKeys.OWNER_NAME),
      cre2c_status: Status.New,
      cre2c_paymentreference: '000000001x',
      cre2c_uniquefeatures: itemDescription.uniqueFeatures,
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

    const isSection2 = itemType === ItemType.HIGH_VALUE

    if (isSection2) {
      body.whereMade = itemDescription.whereMade
      body.whenMade = itemDescription.whenMade
    }

    // TODO handle errors
    ODataService.createRecord(body, isSection2)

    // if (_recordCreationFailed(state)) {
    return h.redirect(Paths.SERVICE_COMPLETE)
    // }
  }
}

const _getExemptionCategoryCode = itemType => {
  return ExemptionTypeLookup[itemType]
}

// const _recordCreationFailed = state => {
//   return state && state.status && state.status === PaymentResult.FAILED
// }

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SAVE_RECORD}`,
    handler: handlers.get
  }
]
