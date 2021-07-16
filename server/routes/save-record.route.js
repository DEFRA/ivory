'use strict'

const { Paths, RedisKeys } = require('../utils/constants')
const ODataService = require('../services/odata.service')
const RedisService = require('../services/redis.service')

const handlers = {
  get: async (request, h) => {
    // TODO remove this
    console.log('Saving record')

    const STATUS_NEW = 881990003

    const itemDescription =
      JSON.parse(
        await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
      ) || {}

    // Only Section 2:
    // whereMade: itemDescription.whereMade || NOT_APPLICABLE,
    // whenMade: itemDescription.whenMade || NOT_APPLICABLE,

    const body = {
      cre2c_submissiondate: '2021-06-28T00:00:00Z',
      cre2c_whyivoryintegral: 881990000,
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
      cre2c_exemptioncategory: 881990002,
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
      cre2c_status: STATUS_NEW,
      cre2c_paymentreference: '000000001x',
      cre2c_uniquefeatures: itemDescription.uniqueFeatures,
      cre2c_applicantname: await RedisService.get(
        request,
        RedisKeys.APPLICANT_NAME
      ),
      // overriddencreatedon: null,
      cre2c_applicantemail: await RedisService.get(
        request,
        RedisKeys.APPLICANT_EMAIL_ADDRESS
      ),
      // importsequencenumber: null,
      // utcconversiontimezonecode: null,
      cre2c_applicantaddress: await RedisService.get(
        request,
        RedisKeys.APPLICANT_ADDRESS
      )
    }

    // TODO handle errors
    ODataService.createRecord(body)

    // if (_recordCreationFailed(state)) {
    return h.redirect(Paths.SERVICE_COMPLETE)
    // }
  }
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
