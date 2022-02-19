'use strict'

const TestHelper = require('../utils/test-helper')

const {
  DataVerseFieldName,
  ItemType,
  IvoryVolumeReasons,
  Options,
  RedisKeys
} = require('../../server/utils/constants')

jest.mock('../../server/services/azure-blob.service')
const AzureBlobService = require('../../server/services/azure-blob.service')

jest.mock('../../server/services/redis.service')
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
    server = await TestHelper.createServer()
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
          [DataVerseFieldName.SECTION_10_CASE_ID]: 'THE_SECTION_10_CASE_ID'
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
          [DataVerseFieldName.SECTION_2_CASE_ID]: 'THE_SECTION_2_CASE_ID'
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

    describe('GET: Section 2 resale', () => {
      beforeEach(async () => {
        _createSection2ResaleRedisMock()
      })

      it('should update the record in the dataverse and redirect to the service complete page', async () => {
        PaymentService.lookupPayment = jest
          .fn()
          .mockResolvedValue({ state: { status: 'success' } })

        expect(ODataService.updateRecord).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(ODataService.updateRecord).toBeCalledTimes(1)

        expect(ODataService.updateRecord).toBeCalledWith(
          'EXISTING_SECTION_2_CASE_ID',
          {
            [DataVerseFieldName.SECTION_2_CASE_ID]:
              'EXISTING_SECTION_2_CASE_ID',
            [DataVerseFieldName.PREVIOUS_OWNER_NAME]: 'EXISTING_OWNER_NAME',
            [DataVerseFieldName.PREVIOUS_OWNER_EMAIL]: 'EXISTING_OWNER_EMAIL',
            [DataVerseFieldName.PREVIOUS_OWNER_ADDRESS]:
              'EXISTING_OWNER_ADDRESS',
            [DataVerseFieldName.PREVIOUS_OWNER_POSTCODE]:
              'EXISTING_OWNER_POSTCODE',
            [DataVerseFieldName.PREVIOUS_APPLICANT_NAME]:
              'EXISTING_APPLICANT_NAME',
            [DataVerseFieldName.PREVIOUS_APPLICANT_EMAIL]:
              'EXISTING_APPLICANT_EMAIL',
            [DataVerseFieldName.PREVIOUS_APPLICANT_ADDRESS]:
              'EXISTING_APPLICANT_ADDRESS',
            [DataVerseFieldName.PREVIOUS_APPLICANT_POSTCODE]:
              'EXISTING_APPLICANT_POSTCODE',
            [DataVerseFieldName.PREVIOUS_OWNED_BY_APPLICANT]: undefined,
            [DataVerseFieldName.PREVIOUS_WORK_FOR_A_BUSINESS]: undefined,
            [DataVerseFieldName.PREVIOUS_SELLING_ON_BEHALF_OF]: undefined,
            [DataVerseFieldName.PREVIOUS_CAPACITY]: undefined,
            [DataVerseFieldName.PREVIOUS_CAPACITY_OTHER]: undefined,
            [DataVerseFieldName.OWNED_BY_APPLICANT]: false,
            [DataVerseFieldName.OWNER_NAME]: undefined,
            [DataVerseFieldName.OWNER_EMAIL]: 'OWNER_EMAIL_ADDRESS',
            [DataVerseFieldName.OWNER_ADDRESS]: '123 OWNER STREET, OWNER TOWN',
            [DataVerseFieldName.OWNER_POSTCODE]: 'OW1 1AB',
            [DataVerseFieldName.APPLICANT_NAME]: undefined,
            [DataVerseFieldName.APPLICANT_EMAIL]: 'APPLICANT_EMAIL_ADDRESS',
            [DataVerseFieldName.APPLICANT_ADDRESS]:
              '123 APPLICANT STREET, APPLICANT TOWN',
            [DataVerseFieldName.APPLICANT_POSTCODE]: 'AP1 1AB',
            [DataVerseFieldName.WORK_FOR_A_BUSINESS]: false,
            [DataVerseFieldName.SELLING_ON_BEHALF_OF]: 881990005,
            [DataVerseFieldName.CAPACITY]: 881990003,
            [DataVerseFieldName.CAPACITY_OTHER]: 'Some other capacity',
            [DataVerseFieldName.ALREADY_HAS_CERTIFICATE]: 881990000,
            [DataVerseFieldName.APPLIED_BEFORE]: false,
            [DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER]: undefined,
            [DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER]: undefined
          }
        )

        expect(response.headers.location).toEqual(nextUrl)
      })

      it('should NOT save the record in the dataverse when the payment has failed and redirect to the service complete page', async () => {
        PaymentService.lookupPayment = jest
          .fn()
          .mockResolvedValue({ state: { status: 'failure' } })

        expect(ODataService.updateRecord).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(ODataService.updateRecord).toBeCalledTimes(0)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  AzureBlobService.get = jest.fn().mockReturnValue(Buffer.from([]))

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

const _createSection2ResaleRedisMock = () => {
  RedisService.get = jest.fn(
    (request, redisKey) => section2ResaleRedisMockDataMap[redisKey]
  )
}

const mockItemDescriptionSection10 = {
  whatIsItem: 'Piano',
  whereIsIvory: 'On the keys',
  distinguishingFeatures: 'one of the keys is cracked'
}

const mockItemDescriptionSection2 = {
  whatIsItem: 'Chest of drawers',
  whereIsIvory: 'Chest has ivory knobs',
  distinguishingFeatures: 'One of the feet is cracked',
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
  fileSizes: [100, 200]
}

const mockImageUploadData = {
  files: ['lamp1.png', 'lamp2.png'],
  fileSizes: [100, 200],
  thumbnails: ['lamp1-thumbnail.png', 'lamp2-thumbnail.png'],
  thumbnailData: ['lamp-thumbnail-data1', 'lamp-thumbnail-data2']
}

const section10RedisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: '123456789',
  [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.MUSICAL,
  [RedisKeys.DESCRIBE_THE_ITEM]: mockItemDescriptionSection10,
  [RedisKeys.IVORY_VOLUME]: {
    ivoryVolume: IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT
  },
  [RedisKeys.IVORY_AGE]: {
    ivoryAge: [
      'It has a stamp, serial number or signature to prove its age',
      'Other reason'
    ],
    otherReason: 'Some other reason'
  },
  [RedisKeys.SUBMISSION_DATE]: 'SUBMISSION_DATE',
  [RedisKeys.SUBMISSION_REFERENCE]: 'SUBMISSION_REFERENCE',
  [RedisKeys.INTENTION_FOR_ITEM]: 'Sell it',
  [RedisKeys.UPLOAD_PHOTO]: mockImageUploadData,

  [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerData,
  [RedisKeys.OWNER_ADDRESS]: '123 OWNER STREET, OWNER TOWN, OW1 1AB',
  [RedisKeys.APPLICANT_CONTACT_DETAILS]: mockApplicantData,
  [RedisKeys.APPLICANT_ADDRESS]:
    '123 APPLICANT STREET, APPLICANT TOWN, AP1 1AB',
  [RedisKeys.WHAT_CAPACITY]: {
    whatCapacity: 'Other',
    otherCapacity: 'Some other capacity'
  },
  [RedisKeys.WORK_FOR_A_BUSINESS]: true,
  [RedisKeys.SELLING_ON_BEHALF_OF]: 'Other'
}

const section2RedisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: '123456789',
  [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
  [RedisKeys.DESCRIBE_THE_ITEM]: mockItemDescriptionSection2,
  [RedisKeys.IVORY_VOLUME]: {
    ivoryVolume: IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT
  },
  [RedisKeys.IVORY_AGE]: {
    ivoryAge: [
      'It has a stamp, serial number or signature to prove its age',
      'Other reason'
    ],
    otherReason: 'Some other reason'
  },
  [RedisKeys.SUBMISSION_DATE]: 'SUBMISSION_DATE',
  [RedisKeys.SUBMISSION_REFERENCE]: 'SUBMISSION_REFERENCE',
  [RedisKeys.INTENTION_FOR_ITEM]: 'Hire it out',
  [RedisKeys.UPLOAD_PHOTO]: mockImageUploadData,
  [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerData,
  [RedisKeys.OWNER_ADDRESS]: '123 OWNER STREET, OWNER TOWN, OW1 1AB',
  [RedisKeys.APPLICANT_CONTACT_DETAILS]: mockApplicantData,
  [RedisKeys.APPLICANT_ADDRESS]:
    '123 APPLICANT STREET, APPLICANT TOWN, AP1 1AB',
  [RedisKeys.TARGET_COMPLETION_DATE]: 'TARGET_COMPLETION_DATE',
  [RedisKeys.UPLOAD_DOCUMENT]: mockFileAttachmentData,
  [RedisKeys.WHY_IS_ITEM_RMI]: 'RMI_REASON',
  [RedisKeys.WHAT_CAPACITY]: {
    whatCapacity: 'Other',
    otherCapacity: 'Some other capacity'
  },
  [RedisKeys.WORK_FOR_A_BUSINESS]: true,
  [RedisKeys.SELLING_ON_BEHALF_OF]: 'Other'
}

const section2ResaleRedisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: '123456789',
  [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
  [RedisKeys.DESCRIBE_THE_ITEM]: mockItemDescriptionSection2,
  [RedisKeys.IVORY_VOLUME]: {
    ivoryVolume: IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT
  },
  [RedisKeys.IVORY_AGE]: {
    ivoryAge: [
      'It has a stamp, serial number or signature to prove its age',
      'Other reason'
    ],
    otherReason: 'Some other reason'
  },
  [RedisKeys.SUBMISSION_DATE]: 'SUBMISSION_DATE',
  [RedisKeys.SUBMISSION_REFERENCE]: 'SUBMISSION_REFERENCE',
  [RedisKeys.INTENTION_FOR_ITEM]: 'Hire it out',
  [RedisKeys.UPLOAD_PHOTO]: mockImageUploadData,
  [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerData,
  [RedisKeys.OWNER_ADDRESS]: '123 OWNER STREET, OWNER TOWN, OW1 1AB',
  [RedisKeys.APPLICANT_CONTACT_DETAILS]: mockApplicantData,
  [RedisKeys.APPLICANT_ADDRESS]:
    '123 APPLICANT STREET, APPLICANT TOWN, AP1 1AB',
  [RedisKeys.TARGET_COMPLETION_DATE]: 'TARGET_COMPLETION_DATE',
  [RedisKeys.UPLOAD_DOCUMENT]: mockFileAttachmentData,
  [RedisKeys.WHY_IS_ITEM_RMI]: 'RMI_REASON',
  [RedisKeys.WHAT_CAPACITY]: {
    whatCapacity: 'Other',
    otherCapacity: 'Some other capacity'
  },
  [RedisKeys.WORK_FOR_A_BUSINESS]: true,
  [RedisKeys.SELLING_ON_BEHALF_OF]: 'Other',
  [RedisKeys.ALREADY_CERTIFIED]: { alreadyCertified: Options.YES },
  [RedisKeys.ALREADY_CERTIFIED_EXISTING_RECORD]: {
    [DataVerseFieldName.SECTION_2_CASE_ID]: 'EXISTING_SECTION_2_CASE_ID',
    [DataVerseFieldName.OWNER_NAME]: 'EXISTING_OWNER_NAME',
    [DataVerseFieldName.OWNER_EMAIL]: 'EXISTING_OWNER_EMAIL',
    [DataVerseFieldName.OWNER_ADDRESS]: 'EXISTING_OWNER_ADDRESS',
    [DataVerseFieldName.OWNER_POSTCODE]: 'EXISTING_OWNER_POSTCODE',
    [DataVerseFieldName.APPLICANT_NAME]: 'EXISTING_APPLICANT_NAME',
    [DataVerseFieldName.APPLICANT_EMAIL]: 'EXISTING_APPLICANT_EMAIL',
    [DataVerseFieldName.APPLICANT_ADDRESS]: 'EXISTING_APPLICANT_ADDRESS',
    [DataVerseFieldName.APPLICANT_POSTCODE]: 'EXISTING_APPLICANT_POSTCODE'
  }
}
