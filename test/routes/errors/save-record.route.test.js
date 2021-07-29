'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')

const {
  ItemType,
  IvoryVolumeReasons
} = require('../../../server/utils/constants')

jest.mock('../../../server/services/odata.service')
const ODataService = require('../../../server/services/odata.service')

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
          .mockResolvedValueOnce(ItemType.MUSICAL)
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
          .mockResolvedValueOnce(
            JSON.stringify({
              whatIsItem: 'chest of drawers',
              whereIsIvory: 'chest has ivory knobs',
              uniqueFeatures: 'one of the feet is cracked',
              whereMade: 'Europe',
              whenMade: 'Georgian era'
            })
          )
          .mockResolvedValueOnce('SUBMISSION_DATE')
          .mockResolvedValueOnce('PAYMENT_ID')
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

      it('should redirect to ... - Section 10', async () => {
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
    })

    describe('GET: Section 2', () => {
      beforeEach(async () => {
        ODataService.createRecord = jest.fn().mockResolvedValue({
          cre2c_ivorysection2caseid: 'THE_SECTION_2_CASE_ID'
        })

        // TODO add mock return values
        RedisService.get = jest.fn()
      })

      it('should redirect to ... - Section 2', async () => {
        // TODO - add tests
      })
    })
  })
})

const _createMocks = () => {
  ODataService.updateRecord = jest.fn()
}

const mockImageUploadData = {
  files: ['lamp1.png', 'lamp2.png'],
  fileData: [],
  fileSizes: [100, 200],
  thumbnails: ['lamp1-thumbnail.png', 'lamp2-thumbnail.png'],
  thumbnailData: []
}
