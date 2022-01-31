'use strict'

const TestHelper = require('../utils/test-helper')

jest.mock('randomstring')
const RandomString = require('randomstring')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/payment.service')
const PaymentService = require('../../server/services/payment.service')

const { ItemType, RedisKeys } = require('../../server/utils/constants')

const paymentReference = 'ABCDEF'
const paymentId = 'THE_PAYMENT_ID'

describe('/make-payment route', () => {
  let server
  const url = '/make-payment'
  const nextUrl = 'THE_NEXT_URL'

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

    beforeEach(async () => {
      const response = {
        payment_id: paymentId,
        _links: {
          next_url: {
            href: nextUrl
          }
        }
      }
      PaymentService.makePayment = jest.fn().mockReturnValue(response)
    })

    it('should redirect back to the "Service complete" page - Section 10', async () => {
      const mockData = {
        [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.MUSICAL,
        [RedisKeys.ALREADY_CERTIFIED]: null,
        [RedisKeys.PAYMENT_AMOUNT]: '2000',
        [RedisKeys.APPLICANT_CONTACT_DETAILS]: {
          name: 'OWNER_NAME',
          emailAddress: 'OWNER_EMAIL_ADDRESS'
        }
      }

      RedisService.get = jest.fn((request, redisKey) => {
        return mockData[redisKey]
      })

      const response = await TestHelper.submitGetRequest(
        server,
        getOptions,
        302,
        false
      )

      expect(RedisService.get).toBeCalledTimes(4)

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.PAYMENT_AMOUNT
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.APPLICANT_CONTACT_DETAILS
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )

      expect(RedisService.set).toBeCalledTimes(2)

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        RedisKeys.SUBMISSION_DATE,
        // TODO - mock current time
        expect.any(String)
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        RedisKeys.PAYMENT_ID,
        paymentId
      )

      expect(response.headers.location).toEqual(nextUrl)
    })

    it('should redirect back to the "Service complete" page - Section 2, not already certified', async () => {
      const mockData = {
        [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
        [RedisKeys.ALREADY_CERTIFIED]: null,
        [RedisKeys.PAYMENT_AMOUNT]: '25000',
        [RedisKeys.APPLICANT_CONTACT_DETAILS]: {
          name: 'OWNER_NAME',
          emailAddress: 'OWNER_EMAIL_ADDRESS'
        }
      }

      RedisService.get = jest.fn((request, redisKey) => {
        return mockData[redisKey]
      })

      const response = await TestHelper.submitGetRequest(
        server,
        getOptions,
        302,
        false
      )

      expect(RedisService.get).toBeCalledTimes(5)

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.ALREADY_CERTIFIED
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.PAYMENT_AMOUNT
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.SUBMISSION_REFERENCE
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        RedisKeys.APPLICANT_CONTACT_DETAILS
      )

      expect(RedisService.set).toBeCalledTimes(3)

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        RedisKeys.SUBMISSION_DATE,
        // TODO - mock current time
        expect.any(String)
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        RedisKeys.TARGET_COMPLETION_DATE,
        // TODO - mock current time
        expect.any(String)
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        RedisKeys.PAYMENT_ID,
        paymentId
      )

      expect(response.headers.location).toEqual(nextUrl)
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()

  RandomString.generate = jest.fn().mockReturnValue(paymentReference)
  RedisService.get = jest.fn()
}
