'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ServerEvents } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/payment.service')
const PaymentService = require('../../server/services/payment.service')

describe('/service-complete route', () => {
  let server
  const url = '/service-complete'
  const nextUrlMakePayment = '/make-payment'
  const nextUrlCheckYourAnswers = '/check-your-answers'

  const elementIds = {
    pageTitle: 'pageTitle',
    referenceNumber: 'referenceNumber'
  }

  let document

  beforeAll(async done => {
    server = await createServer()
    server.events.on(ServerEvents.PLUGINS_LOADED, () => {
      done()
    })
  })

  afterAll(() => {
    server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const paymentReference = 'PAYMENT_REFERENCE'

    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn().mockReturnValue(paymentReference)
    })

    describe('GET: Success', () => {
      beforeEach(async () => {
        const payment = {
          state: {
            status: 'success'
          }
        }
        PaymentService.lookupPayment = jest.fn().mockReturnValue(payment)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should NOT have the Back link', () => {
        TestHelper.checkBackLink(document, false)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(
          `#${elementIds.pageTitle} .govuk-panel__title`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toContain(
          'Application complete'
        )
      })

      it('should have the correct reference number', () => {
        const element = document.querySelector(`#${elementIds.referenceNumber}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(paymentReference)
      })
    })

    describe('GET: Failure', () => {
      it('should redirect back to the "Check your answers" page if the payment was cancelled', async () => {
        const payment = {
          state: {
            status: 'failed',
            code: 'P0030'
          }
        }
        PaymentService.lookupPayment = jest.fn().mockReturnValue(payment)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(response.headers.location).toEqual(nextUrlCheckYourAnswers)
      })

      it('should redirect back to the payment page if the payment failed', async () => {
        const payment = {
          state: {
            status: 'failed'
          }
        }
        PaymentService.lookupPayment = jest.fn().mockReturnValue(payment)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(response.headers.location).toEqual(nextUrlMakePayment)
      })
    })
  })
})
