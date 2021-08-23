'use strict'

const { ItemType } = require('../../server/utils/constants')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/cookie.service')
const CookieService = require('../../server/services/cookie.service')

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
    submissionReference: 'submissionReference',
    helpText1: 'helpText1',
    applicantEmail: 'applicantEmail',
    ownerEmail: 'ownerEmail',
    heading2: 'heading2',
    helpText2: 'helpText2',
    helpText3: 'helpText3',
    helpText4: 'helpText4',
    helpText5: 'helpText5',
    finish: 'finish'
  }

  const submissionReference = '1234ABCD'
  const applicantEmail = 'applicant@test.com'
  const ownerEmail = 'owner@test.com'

  let document

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

  describe('GET - NON RMI application. Applicant is the owner', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn()
        .mockResolvedValueOnce('PAYMENT_REFERENCE')
        .mockResolvedValueOnce(ItemType.MUSICAL)
        .mockResolvedValueOnce(submissionReference)
        .mockResolvedValueOnce(applicantEmail)
        .mockResolvedValueOnce(applicantEmail) // Owner email set same as applicant
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
          'Self-assessment complete'
        )
      })

      it('should have the correct reference number', () => {
        const element = document.querySelector(`#${elementIds.submissionReference}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(submissionReference)
      })

      it('should have the correct text in helpText1', () => {
        const element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('We’ve also sent these details to:')
      })

      it('should have the correct applicant email address', () => {
        const element = document.querySelector(`#${elementIds.applicantEmail}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(applicantEmail)
      })

      it('should NOT display owner email address as same as applicants', () => {
        const element = document.querySelector(`#${elementIds.ownerEmail}`)
        expect(element).toBeFalsy()
      })

      it('should have the correct text in helpText2', () => {
        const element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('You can sell or hire out the item at your own risk.')
      })

      it('should have the correct text in helpText3', () => {
        const element = document.querySelector(`#${elementIds.helpText3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('If you do so, and we later discover that you’ve given us false information, you could be fined or prosecuted.')
      })

      it('should have the correct text in helpText4', () => {
        const element = document.querySelector(`#${elementIds.helpText4}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('This self-assessment lasts until the owner of the item changes.')
      })

      it('should NOT have any text in helpText5', () => {
        const element = document.querySelector(`#${elementIds.helpText5}`)
        expect(element).toBeFalsy()
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.finish}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Finish')
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

      it('should redirect back to the "Check your answers" page if there is a general error', async () => {
        const payment = {
          state: {
            status: 'error'
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
    })
  })

  describe('GET - RMI application. Applicant is NOT the owner', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      RedisService.get = jest.fn()
        .mockResolvedValueOnce('PAYMENT_REFERENCE')
        .mockResolvedValueOnce(ItemType.HIGH_VALUE)
        .mockResolvedValueOnce(submissionReference)
        .mockResolvedValueOnce(applicantEmail)
        .mockResolvedValueOnce(ownerEmail)
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
          'Application received'
        )
      })

      it('should have the correct reference number', () => {
        const element = document.querySelector(`#${elementIds.submissionReference}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(submissionReference)
      })

      it('should have the correct text in helpText1', () => {
        const element = document.querySelector(`#${elementIds.helpText1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('We’ve sent confirmation of this application to:')
      })

      it('should have the correct applicant email address', () => {
        const element = document.querySelector(`#${elementIds.applicantEmail}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(applicantEmail)
      })

      it('should have the correct owner email address', () => {
        const element = document.querySelector(`#${elementIds.ownerEmail}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(ownerEmail)
      })

      it('should have the correct text in helpText2', () => {
        const element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('An expert will now check your application.')
      })

      it('should have the correct text in helpText3', () => {
        const element = document.querySelector(`#${elementIds.helpText3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Checks usually happen within 30 days, and we may contact you during this time if we require more information.')
      })

      it('should have the correct text in helpText4', () => {
        const element = document.querySelector(`#${elementIds.helpText4}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('If your application is approved, we will send you an exemption certificate so you can sell or hire out your item.')
      })

      it('should have the correct text in helpText5', () => {
        const element = document.querySelector(`#${elementIds.helpText5}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('If you have not heard from us within 30 days, you can contact us at ivory@apha.gov.uk. Make sure you have your submission reference number, so we can find your details.')
      })
    })
  })
})

const _createMocks = () => {
  CookieService.checkSessionCookie = jest
    .fn()
    .mockReturnValue('THE_SESSION_COOKIE')
}
