'use strict'

jest.mock('@defra/hapi-gapi')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

const {
  ItemType,
  IvoryVolumeReasons,
  RedisKeys
} = require('../../server/utils/constants')

const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/odata.service')
const ODataService = require('../../server/services/odata.service')

jest.mock('../../server/services/payment.service')
const PaymentService = require('../../server/services/payment.service')

describe('/save-record route', () => {
  let server
  const url = '/save-record'
  const nextUrl = '/service-complete'

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    describe('GET: Section 10', () => {
      beforeEach(async () => {
        ODataService.createRecord = jest.fn().mockResolvedValue({
          cre2c_ivorysection10caseid: 'THE_SECTION_10_CASE_ID'
        })

        _createSection10RedisMock()
      })

      it('should save the record in the dataverse and redirect to the service complete page', async () => {
        PaymentService.lookupPayment = jest
          .fn()
          .mockResolvedValue({ state: { status: 'success' } })

        expect(ODataService.createRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecord).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(ODataService.createRecord).toBeCalledTimes(1)
        expect(ODataService.updateRecord).toBeCalledTimes(1)

        expect(response.headers.location).toEqual(nextUrl)
      })

      it('should NOT save the record in the dataverse when the payment has failed and redirect to the service complete page', async () => {
        PaymentService.lookupPayment = jest
          .fn()
          .mockResolvedValue({ state: { status: 'failure' } })

        expect(ODataService.createRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecord).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(ODataService.createRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecord).toBeCalledTimes(0)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })

    describe('GET: Section 2', () => {
      beforeEach(async () => {
        ODataService.createRecord = jest.fn().mockResolvedValue({
          cre2c_ivorysection2caseid: 'THE_SECTION_2_CASE_ID'
        })

        _createSection2RedisMock()
      })

      it('should save the record in the dataverse and redirect to the service complete page', async () => {
        PaymentService.lookupPayment = jest
          .fn()
          .mockResolvedValue({ state: { status: 'success' } })

        expect(ODataService.createRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecordAttachments).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(ODataService.createRecord).toBeCalledTimes(1)
        expect(ODataService.updateRecord).toBeCalledTimes(1)
        expect(ODataService.updateRecordAttachments).toBeCalledTimes(1)

        expect(response.headers.location).toEqual(nextUrl)
      })

      it('should NOT save the record in the dataverse when the payment has failed and redirect to the service complete page', async () => {
        PaymentService.lookupPayment = jest
          .fn()
          .mockResolvedValue({ state: { status: 'failure' } })

        expect(ODataService.createRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecord).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(ODataService.createRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecord).toBeCalledTimes(0)
        expect(ODataService.updateRecordAttachments).toBeCalledTimes(0)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  ODataService.updateRecord = jest.fn()
  ODataService.updateRecordAttachments = jest.fn()
}

const _createSection10RedisMock = () => {
  RedisService.get = jest.fn(
    (request, redisKey) => section10RedisMockDataMap[redisKey]
  )
}

const _createSection2RedisMock = () => {
  RedisService.get = jest.fn(
    (request, redisKey) => section2RedisMockDataMap[redisKey]
  )
}

const mockItemDescriptionSection10 = {
  whatIsItem: 'Piano',
  whereIsIvory: 'On the keys',
  uniqueFeatures: 'one of the keys is cracked'
}

const mockItemDescriptionSection2 = {
  whatIsItem: 'Chest of drawers',
  whereIsIvory: 'Chest has ivory knobs',
  uniqueFeatures: 'One of the feet is cracked',
  whereMade: 'Europe',
  whenMade: 'Georgian era'
}

const mockOwnerData = {
  name: 'THE_OWNER',
  emailAddress: 'OWNER_EMAIL_ADDRESS'
}

const mockApplicantData = {
  name: 'THE_APPLICANT',
  emailAddress: 'APPLICANT_EMAIL_ADDRESS'
}

const mockFileAttachmentData = {
  files: ['document1.pdf', 'document2.pdf'],
  fileData: ['document1', 'document12'],
  fileSizes: [100, 200]
}

const mockImageUploadData = {
  files: ['lamp1.png', 'lamp2.png'],
  fileData: ['lamp-data1', 'lamp-data2'],
  fileSizes: [100, 200],
  thumbnails: ['lamp1-thumbnail.png', 'lamp2-thumbnail.png'],
  thumbnailData: ['lamp-thumbnail-data1', 'lamp-thumbnail-data2']
}

const section10RedisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: '123456789',
  [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.MUSICAL,
  [RedisKeys.DESCRIBE_THE_ITEM]: JSON.stringify(mockItemDescriptionSection10),
  [RedisKeys.IVORY_VOLUME]: JSON.stringify({
    ivoryVolume: IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT
  }),
  [RedisKeys.IVORY_AGE]: JSON.stringify({
    ivoryAge: [
      'It has a stamp, serial number or signature to prove its age',
      'Other reason'
    ],
    otherReason: 'Some other reason'
  }),
  [RedisKeys.SUBMISSION_DATE]: 'SUBMISSION_DATE',
  [RedisKeys.SUBMISSION_REFERENCE]: 'SUBMISSION_REFERENCE',
  [RedisKeys.INTENTION_FOR_ITEM]: 'Sell it',
  [RedisKeys.UPLOAD_PHOTO]: JSON.stringify(mockImageUploadData),

  [RedisKeys.OWNER_CONTACT_DETAILS]: JSON.stringify(mockOwnerData),
  [RedisKeys.OWNER_ADDRESS]: 'OWNER_ADDRESS',
  [RedisKeys.APPLICANT_CONTACT_DETAILS]: JSON.stringify(mockApplicantData),
  [RedisKeys.APPLICANT_ADDRESS]: 'APPLICANT_ADDRESS'
}

const section2RedisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: '123456789',
  [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
  [RedisKeys.DESCRIBE_THE_ITEM]: JSON.stringify(mockItemDescriptionSection2),
  [RedisKeys.IVORY_VOLUME]: JSON.stringify({
    ivoryVolume: IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT
  }),
  [RedisKeys.IVORY_AGE]: JSON.stringify({
    ivoryAge: [
      'It has a stamp, serial number or signature to prove its age',
      'Other reason'
    ],
    otherReason: 'Some other reason'
  }),
  [RedisKeys.SUBMISSION_DATE]: 'SUBMISSION_DATE',
  [RedisKeys.SUBMISSION_REFERENCE]: 'SUBMISSION_REFERENCE',
  [RedisKeys.INTENTION_FOR_ITEM]: 'Hire it out',
  [RedisKeys.UPLOAD_PHOTO]: JSON.stringify(mockImageUploadData),
  [RedisKeys.OWNER_CONTACT_DETAILS]: JSON.stringify(mockOwnerData),
  [RedisKeys.OWNER_ADDRESS]: 'OWNER_ADDRESS',
  [RedisKeys.APPLICANT_CONTACT_DETAILS]: JSON.stringify(mockApplicantData),
  [RedisKeys.APPLICANT_ADDRESS]: 'APPLICANT_ADDRESS',
  [RedisKeys.TARGET_COMPLETION_DATE]: 'TARGET_COMPLETION_DATE',
  [RedisKeys.UPLOAD_DOCUMENT]: JSON.stringify(mockFileAttachmentData),
  [RedisKeys.WHY_IS_ITEM_RMI]: 'RMI_REASON'
}
