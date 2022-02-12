'use strict'

jest.mock('../../server/services/redis.service')
const CookieService = require('../../server/services/cookie.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

const TestHelper = require('../utils/test-helper')

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

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    it('should redirect to the "How certain" route', async () => {
      const response = await TestHelper.submitGetRequest(
        server,
        getOptions,
        302,
        false
      )

      expect(response.headers.location).toEqual(nextUrl)
    })

    it('should delete previous session data if there is any', async () => {
      CookieService.checkForSessionKey = jest
        .fn()
        .mockReturnValue('THE SESSION KEY')

      expect(RedisService.deleteSessionData).toBeCalledTimes(0)

      await TestHelper.submitGetRequest(server, getOptions, 302, false)

      expect(RedisService.deleteSessionData).toBeCalledTimes(1)
    })

    it("should NOT delete previous session data if there isn't any", async () => {
      CookieService.checkForSessionKey = jest.fn().mockReturnValue(null)

      expect(RedisService.deleteSessionData).toBeCalledTimes(0)

      await TestHelper.submitGetRequest(server, getOptions, 302, false)

      expect(RedisService.deleteSessionData).toBeCalledTimes(0)
    })
  })
})
