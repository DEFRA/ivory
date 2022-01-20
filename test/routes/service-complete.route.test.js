'use strict'
import { jest } from '@jest/globals';
import { ItemType, Options, RedisKeys, EmailTypes } from '../../server/utils/constants.js';
import TestHelper from '../utils/test-helper.js';

jest.mock('./server/services/redis.service.js')
import RedisService from '../../server/services/redis.service.js';

jest.mock('./server/services/payment.service.js')
import PaymentService from '../../server/services/payment.service.js';

jest.mock('./server/services/notification.service.js')
import NotificationService from '../../server/services/notification.service.js';

describe('/service-complete route', () => {
  let server
  const url = '/service-complete'
  const nextUrlMakePayment = '/make-payment'
  const nextUrlCheckYourAnswers = '/check-your-answers'

  const elementIds = {
    pageTitle: 'pageTitle',
    submissionReference: 'submissionReference',
    initialHelpText: 'initialHelpText',
    applicantEmail: 'applicantEmail',
    ownerEmail: 'ownerEmail',
    heading2: 'heading2',
    step1: 'step-1',
    step2: 'step-2',
    step3: 'step-3',
    additionalStep: 'additionalStep',
    finish: 'finish',
    feedbackLink: 'feedbackLink'
  }

  const SLA = 35

  let document

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

    describe('Section 10', () => {
      beforeEach(() => {
        _createSection10RedisMock(Options.YES)
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
            'Self-declaration complete'
          )
        })

        it('should have the correct reference number', () => {
          const element = document.querySelector(
            `#${elementIds.submissionReference}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            submissionReference
          )
        })

        it('should have the correct initial help text', () => {
          const element = document.querySelector(
            `#${elementIds.initialHelpText}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'We’ve also sent these details to:'
          )
        })

        it('should have the correct applicant email address', () => {
          const element = document.querySelector(
            `#${elementIds.applicantEmail}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            mockOwnerContactDetails.emailAddress
          )
        })

        it('should NOT display owner email address as same as applicants', () => {
          const element = document.querySelector(`#${elementIds.ownerEmail}`)
          expect(element).toBeFalsy()
        })

        it('should have the correct "next steps" help Text', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can sell or hire out the item at your own risk.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If we later discover that any of the information you have given is incorrect, your registration may be cancelled, and you may be subject to a fine of up to £250,000, or 5 years imprisonment.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'This registration expires when the owner of the item changes.'
          )
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.finish}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Finish')
        })

        it('should have the correct feedback link', () => {
          const element = document.querySelector(`#${elementIds.feedbackLink}`)
          TestHelper.checkLink(
            element,
            'What did you think of this service?',
            'https://defragroup.eu.qualtrics.com/jfe/form/SV_0vtTE03cG8IQiBU'
          )
        })
      })
    })

    describe('Section 2 ', () => {
      describe('Success: Not already certified', () => {
        beforeEach(() => {
          _createSection2RedisMock(Options.NO, false)
        })

        beforeEach(async () => {
          const payment = {
            state: {
              status: 'success'
            }
          }
          PaymentService.lookupPayment = jest.fn().mockReturnValue(payment)

          document = await TestHelper.submitGetRequest(server, getOptions)
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
          const element = document.querySelector(
            `#${elementIds.submissionReference}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            submissionReference
          )
        })

        it('should have the correct initial help text', () => {
          const element = document.querySelector(
            `#${elementIds.initialHelpText}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'We’ve sent confirmation of this application to:'
          )
        })

        it('should have the correct applicant email address', () => {
          const element = document.querySelector(
            `#${elementIds.applicantEmail}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            mockApplicantContactDetails.emailAddress
          )
        })

        it('should have the correct owner email address', () => {
          const element = document.querySelector(`#${elementIds.ownerEmail}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            mockOwnerContactDetails.emailAddress
          )
        })

        it('should have the correct "next steps" help Text', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Your application will now be sent to an expert for assessment.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `We’ll aim to let you know the outcome of your application within ${SLA}  working days, we’ll let you know if it is going to take longer.`
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Following advice from the expert, we will determine whether to award the item an exemption certificate. We’ll contact you if we need more information.'
          )
        })

        it('should have the correct additional step help text', () => {
          const element = document.querySelector(
            `#${elementIds.additionalStep}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `If you have not heard from us within ${SLA} working days, you can contact us at ivory@apha.gov.uk. Make sure you have your submission reference number, so we can find your details.`
          )
        })

        it('should have the correct feedback link', () => {
          const element = document.querySelector(`#${elementIds.feedbackLink}`)
          TestHelper.checkLink(
            element,
            'What did you think of this service?',
            'https://defragroup.eu.qualtrics.com/jfe/form/SV_0vtTE03cG8IQiBU'
          )
        })
      })

      describe('Success: Already certified', () => {
        beforeEach(() => {
          _createSection2RedisMock(Options.NO, true)
        })

        beforeEach(async () => {
          const payment = {
            state: {
              status: 'success'
            }
          }
          PaymentService.lookupPayment = jest.fn().mockReturnValue(payment)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(
            `#${elementIds.pageTitle} .govuk-panel__title`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toContain(
            'Submission received'
          )
        })

        it('should NOT have the reference number', () => {
          const element = document.querySelector(
            `#${elementIds.submissionReference}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct initial help text', () => {
          const element = document.querySelector(
            `#${elementIds.initialHelpText}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'We’ve sent confirmation of this to:'
          )
        })

        it('should have the correct applicant email address', () => {
          const element = document.querySelector(
            `#${elementIds.applicantEmail}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            mockApplicantContactDetails.emailAddress
          )
        })

        it('should have the correct owner email address', () => {
          const element = document.querySelector(`#${elementIds.ownerEmail}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            mockOwnerContactDetails.emailAddress
          )
        })

        it('should have the correct "next steps" help Text', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now sell or hire out your item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You must pass on the item’s certificate to the new owner as part of the transaction.'
          )
        })

        it('should NOT have the additional step help text', () => {
          const element = document.querySelector(
            `#${elementIds.additionalStep}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct feedback link', () => {
          const element = document.querySelector(`#${elementIds.feedbackLink}`)
          TestHelper.checkLink(
            element,
            'What did you think of this service?',
            'https://defragroup.eu.qualtrics.com/jfe/form/SV_0vtTE03cG8IQiBU'
          )
        })
      })
    })

    describe('GET: Confirmation emails', () => {
      beforeEach(async () => {
        const payment = {
          state: {
            status: 'success'
          }
        }
        PaymentService.lookupPayment = jest.fn().mockReturnValue(payment)
      })

      describe('Section 10, applicant is the owner', () => {
        beforeEach(() => {
          _createSection10RedisMock(Options.YES)
        })

        it('should send 1 confirmation email', async () => {
          expect(NotificationService.sendEmail).toBeCalledTimes(0)
          document = await TestHelper.submitGetRequest(server, getOptions)
          expect(NotificationService.sendEmail).toBeCalledTimes(1)
          expect(NotificationService.sendEmail).toBeCalledWith(
            EmailTypes.CONFIRMATION_EMAIL,
            false,
            mockOwnerContactDetails.emailAddress,
            {
              exemptionType: ItemType.MUSICAL,
              fullName: mockOwnerContactDetails.fullName,
              submissionReference
            }
          )
        })
      })

      describe('Section 10, applicant is NOT the owner, no owner email address available', () => {
        beforeEach(() => {
          _createSection10RedisMock(Options.NO)
        })

        it('should send 2 confirmation emails', async () => {
          expect(NotificationService.sendEmail).toBeCalledTimes(0)
          document = await TestHelper.submitGetRequest(server, getOptions)
          expect(NotificationService.sendEmail).toBeCalledTimes(1)

          expect(NotificationService.sendEmail).toBeCalledWith(
            EmailTypes.CONFIRMATION_EMAIL,
            false,
            mockApplicantContactDetails.emailAddress,
            {
              exemptionType: ItemType.MUSICAL,
              fullName: mockApplicantContactDetails.fullName,
              submissionReference
            }
          )
        })
      })

      describe('Section 2, applicant is the owner', () => {
        beforeEach(() => {
          _createSection2RedisMock(Options.YES, false)
        })

        it('should send 1 confirmation email', async () => {
          expect(NotificationService.sendEmail).toBeCalledTimes(0)
          document = await TestHelper.submitGetRequest(server, getOptions)
          expect(NotificationService.sendEmail).toBeCalledTimes(1)

          expect(NotificationService.sendEmail).toBeCalledWith(
            EmailTypes.CONFIRMATION_EMAIL,
            true,
            mockOwnerContactDetails.emailAddress,
            {
              exemptionType: ItemType.HIGH_VALUE,
              fullName: mockOwnerContactDetails.fullName,
              submissionReference
            }
          )
        })
      })

      describe('Section 2, applicant is NOT the owner', () => {
        beforeEach(() => {
          _createSection2RedisMock(Options.NO, false)
        })

        it('should send 1 confirmation email', async () => {
          expect(NotificationService.sendEmail).toBeCalledTimes(0)
          document = await TestHelper.submitGetRequest(server, getOptions)
          expect(NotificationService.sendEmail).toBeCalledTimes(1)
          expect(NotificationService.sendEmail).toBeCalledWith(
            EmailTypes.CONFIRMATION_EMAIL,
            true,
            mockApplicantContactDetails.emailAddress,
            {
              exemptionType: ItemType.HIGH_VALUE,
              fullName: mockApplicantContactDetails.fullName,
              submissionReference
            }
          )
        })
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
})

const paymentReference = 'PAYMENT_REFERENCE'
const submissionReference = '1234ABCD'

const mockOwnerContactDetails = {
  fullName: 'OWNER_NAME',
  emailAddress: 'OWNER@EMAIL.COM',
  confirmEmailAddress: 'OWNER@EMAIL.COM'
}

const mockApplicantContactDetails = {
  fullName: 'APPLICANT_NAME',
  emailAddress: 'APPLICANT@EMAIL.COM',
  confirmEmailAddress: 'APPLICANT@EMAIL.COM'
}

const redisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: paymentReference,
  [RedisKeys.SUBMISSION_REFERENCE]: submissionReference,
  [RedisKeys.OWNER_CONTACT_DETAILS]: mockOwnerContactDetails
}

const _createMocks = () => {
  TestHelper.createMocks()

  NotificationService.sendEmail = jest.fn()
}

const _createSection2RedisMock = (ownedByApplicant, isAlreadyCertified) => {
  redisMockDataMap[RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT] = ItemType.HIGH_VALUE
  redisMockDataMap[RedisKeys.ALREADY_CERTIFIED] = {
    alreadyCertified: isAlreadyCertified ? Options.YES : Options.NO
  }
  redisMockDataMap[RedisKeys.OWNED_BY_APPLICANT] = ownedByApplicant
  redisMockDataMap[RedisKeys.APPLICANT_CONTACT_DETAILS] =
    ownedByApplicant === Options.YES
      ? mockOwnerContactDetails
      : mockApplicantContactDetails

  RedisService.get = jest.fn((request, redisKey) => {
    return redisMockDataMap[redisKey]
  })
}

const _createSection10RedisMock = ownedByApplicant => {
  redisMockDataMap[RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT] = ItemType.MUSICAL
  redisMockDataMap[RedisKeys.OWNED_BY_APPLICANT] = ownedByApplicant
  redisMockDataMap[RedisKeys.APPLICANT_CONTACT_DETAILS] =
    ownedByApplicant === Options.YES
      ? mockOwnerContactDetails
      : mockApplicantContactDetails

  RedisService.get = jest.fn((request, redisKey) => {
    return redisMockDataMap[redisKey]
  })
}
