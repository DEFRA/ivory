'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

const { ItemType, IvoryVolumeReasons } = require('../../server/utils/constants')

jest.mock('../../server/services/cookie.service')

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

        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('123456789')
          .mockResolvedValueOnce(ItemType.MUSICAL)
          .mockResolvedValueOnce(
            JSON.stringify({
              whatIsItem: 'chest of drawers',
              whereIsIvory: 'chest has ivory knobs',
              uniqueFeatures: 'one of the feet is cracked',
              whereMade: 'Europe',
              whenMade: 'Georgian era'
            })
          )
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryVolume: IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT
            })
          )
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: [
                'It has a stamp, serial number or signature to prove its age',
                'Other reason'
              ],
              otherReason: 'Some other reason'
            })
          )
          .mockResolvedValueOnce('SUBMISSION_DATE')
          .mockResolvedValueOnce('PAYMENT_REFERENCE')
          .mockResolvedValueOnce('Sell it')
          .mockResolvedValueOnce(JSON.stringify(mockImageUploadData))
          .mockResolvedValueOnce('OWNER_NAME')
          .mockResolvedValueOnce('OWNER_EMAIL')
          .mockResolvedValueOnce('OWNER_ADDRESS')
          .mockResolvedValueOnce('APPLICANT_NAME')
          .mockResolvedValueOnce('APPLICANT_EMAIL')
          .mockResolvedValueOnce('APPLICANT_ADDRESS')
          .mockResolvedValueOnce('SUBMISSION_REFERENCE')
          .mockResolvedValueOnce(JSON.stringify(mockImageUploadData))
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

        RedisService.get = jest
          .fn()
          .mockResolvedValueOnce('123456789')
          .mockResolvedValueOnce(ItemType.HIGH_VALUE)
          .mockResolvedValueOnce(
            JSON.stringify({
              whatIsItem: 'chest of drawers',
              whereIsIvory: 'chest has ivory knobs',
              uniqueFeatures: 'one of the feet is cracked',
              whereMade: 'Europe',
              whenMade: 'Georgian era'
            })
          )
          .mockResolvedValueOnce(
            JSON.stringify({
              ivoryAge: [
                'It has a stamp, serial number or signature to prove its age',
                'It’s been carbon-dated'
              ],
              otherReason: null
            })
          )
          .mockResolvedValueOnce('SUBMISSION_DATE')
          .mockResolvedValueOnce('PAYMENT_REFERENCE')
          .mockResolvedValueOnce('Sell it')
          .mockResolvedValueOnce(JSON.stringify(mockImageUploadData))
          .mockResolvedValueOnce('OWNER_NAME')
          .mockResolvedValueOnce('OWNER_EMAIL')
          .mockResolvedValueOnce('OWNER_ADDRESS')
          .mockResolvedValueOnce('APPLICANT_NAME')
          .mockResolvedValueOnce('APPLICANT_EMAIL')
          .mockResolvedValueOnce('APPLICANT_ADDRESS')
          .mockResolvedValueOnce('TARGET_COMPLETION_DATE')
          .mockResolvedValueOnce('SUBMISSION_REFERENCE')
          .mockResolvedValueOnce('RMI_REASON')
          .mockResolvedValueOnce(JSON.stringify(mockImageUploadData))
          .mockResolvedValueOnce(JSON.stringify(mockFileAttachmentData))
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
