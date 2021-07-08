'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('randomstring')
const RandomString = require('randomstring')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/payment.service')
const PaymentService = require('../../server/services/payment.service')

const paymentReference = 'ABCDEF'
const paymentId = 'THE_PAYMENT_ID'

describe('/make-payment route', () => {
  let server
  const url = '/make-payment'
  const nextUrl = 'THE_NEXT_URL'

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

    it('should redirect back to the "Service complete" page', async () => {
      const response = await TestHelper.submitGetRequest(
        server,
        getOptions,
        302,
        false
      )

      expect(RedisService.get).toBeCalledTimes(3)

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        'payment-amount'
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        'what-type-of-item-is-it'
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        'applicant.emailAddress'
      )

      expect(RedisService.set).toBeCalledTimes(2)

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'payment-reference',
        paymentReference
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'payment-id',
        paymentId
      )

      expect(response.headers.location).toEqual(nextUrl)
    })
  })
})

const _createMocks = () => {
  RandomString.generate = jest.fn().mockReturnValue(paymentReference)
  RedisService.get = jest.fn()
  RedisService.set = jest.fn()
}
