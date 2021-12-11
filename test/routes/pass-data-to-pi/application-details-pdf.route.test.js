'use strict'

jest.mock('../../../server/services/odata.service')
const ODataService = require('../../../server/services/odata.service')

const TestHelper = require('../../utils/test-helper')

const mockEntity = require('../../mock-data/section-2-entity')

const KEY = '___THE_KEY___'

describe('/pass-data-to-pi/application-details-pdf route', () => {
  let server
  const url = `/pass-data-to-pi/application-details-pdf?id=123&key=${KEY}`

  const getOptions = {
    method: 'GET',
    url
  }

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    describe('Common content', () => {
      beforeEach(async () => {
        await _createMocks()
      })

      it('should get a PDF document', async () => {
        await TestHelper.submitGetRequest(server, getOptions, 200, false)
      })
    })
  })
})

const _createMocks = async () => {
  TestHelper.createMocks()

  const testEntity = Object.assign({}, mockEntity)

  ODataService.getRecord = jest.fn().mockResolvedValue(testEntity)
}
