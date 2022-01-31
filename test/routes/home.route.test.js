'use strict'

jest.mock('randomstring')
const RandomString = require('randomstring')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const TestHelper = require('../utils/test-helper')
const { RedisKeys } = require('../../server/utils/constants')

describe('/ route', () => {
  let server
  const url = '/'
  const nextUrl = '/eligibility-checker/how-certain'

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

    it('should redirect to the "How certain" route', async () => {
      expect(RedisService.set).toBeCalledTimes(0)

      const response = await TestHelper.submitPostRequest(
        server,
        getOptions,
        302
      )

      expect(RedisService.set).toBeCalledTimes(1)

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        RedisKeys.SUBMISSION_REFERENCE,
        paymentReference
      )

      expect(response.headers.location).toEqual(nextUrl)
    })
  })
})

const paymentReference = 'ABCDEF'

const _createMocks = () => {
  TestHelper.createMocks()

  RandomString.generate = jest.fn().mockReturnValue(paymentReference)
  RedisService.get = jest.fn()
}
