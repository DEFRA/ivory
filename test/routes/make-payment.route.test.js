'use strict'

jest.mock('@defra/hapi-gapi')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('randomstring')
const RandomString = require('randomstring')

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

    it('should redirect back to the "Service complete" page - Section 10', async () => {
      RedisService.get = jest
        .fn()
        .mockResolvedValueOnce('2000')
        .mockResolvedValueOnce(
          'Musical instrument made before 1975 with less than 20% ivory'
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            name: 'OWNER_NAME',
            emailAddress: 'OWNER_EMAIL_ADDRESS'
          })
        )

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
        'applicant-contact-details'
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        'what-type-of-item-is-it'
      )

      expect(RedisService.set).toBeCalledTimes(3)

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'submission-date',
        // TODO - mock current time
        expect.any(String)
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'submission-reference',
        paymentReference
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'payment-id',
        paymentId
      )

      expect(response.headers.location).toEqual(nextUrl)
    })

    it('should redirect back to the "Service complete" page - Section 2', async () => {
      RedisService.get = jest
        .fn()
        .mockResolvedValueOnce('25000')
        .mockResolvedValueOnce(
          'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
        )
        .mockResolvedValueOnce(
          JSON.stringify({
            name: 'OWNER_NAME',
            emailAddress: 'OWNER_EMAIL_ADDRESS'
          })
        )

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
        'applicant-contact-details'
      )

      expect(RedisService.get).toBeCalledWith(
        expect.any(Object),
        'what-type-of-item-is-it'
      )

      expect(RedisService.set).toBeCalledTimes(4)

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'submission-date',
        // TODO - mock current time
        expect.any(String)
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'target-completion-date',
        // TODO - mock current time
        expect.any(String)
      )

      expect(RedisService.set).toBeCalledWith(
        expect.any(Object),
        'submission-reference',
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
  TestHelper.createMocks()

  RandomString.generate = jest.fn().mockReturnValue(paymentReference)
  RedisService.get = jest.fn()
}
