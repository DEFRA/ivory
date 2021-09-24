'use strict'

const {
  ItemType,
  Options,
  RedisKeys,
  EmailTypes
} = require('../../server/utils/constants')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

jest.mock('../../server/services/payment.service')
const PaymentService = require('../../server/services/payment.service')

jest.mock('../../server/services/notification.service')
const NotificationService = require('../../server/services/notification.service')

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

    describe('GET - Section 10 application. Applicant is the owner', () => {
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
            'Self-assessment complete'
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

        it('should have the correct text in helpText1', () => {
          const element = document.querySelector(`#${elementIds.helpText1}`)
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

        it('should have the correct text in helpText2', () => {
          const element = document.querySelector(`#${elementIds.helpText2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can sell or hire out the item at your own risk.'
          )
        })

        it('should have the correct text in helpText3', () => {
          const element = document.querySelector(`#${elementIds.helpText3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If you do so, and we later discover that you’ve given us false information, you could be fined or prosecuted.'
          )
        })

        it('should have the correct text in helpText4', () => {
          const element = document.querySelector(`#${elementIds.helpText4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'This self-assessment lasts until the owner of the item changes.'
          )
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
    })

    describe('GET - Section 2 application. Applicant is NOT the owner', () => {
      beforeEach(() => {
        _createSection2RedisMock(Options.NO)
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

        it('should have the correct text in helpText1', () => {
          const element = document.querySelector(`#${elementIds.helpText1}`)
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

        it('should have the correct text in helpText2', () => {
          const element = document.querySelector(`#${elementIds.helpText2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'An expert will now check your application.'
          )
        })

        it('should have the correct text in helpText3', () => {
          const element = document.querySelector(`#${elementIds.helpText3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Checks usually happen within 30 days, and we may contact you during this time if we require more information.'
          )
        })

        it('should have the correct text in helpText4', () => {
          const element = document.querySelector(`#${elementIds.helpText4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If your application is approved, we will send you an exemption certificate so you can sell or hire out your item.'
          )
        })

        it('should have the correct text in helpText5', () => {
          const element = document.querySelector(`#${elementIds.helpText5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'If you have not heard from us within 30 days, you can contact us at ivory@apha.gov.uk. Make sure you have your submission reference number, so we can find your details.'
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
              fullName: mockOwnerContactDetails.name,
              submissionReference
            }
          )
        })
      })

      describe('Section 10, applicant is NOT the owner', () => {
        beforeEach(() => {
          _createSection10RedisMock(Options.NO)
        })

        it.only('should send 2 confirmation emails', async () => {
          expect(NotificationService.sendEmail).toBeCalledTimes(0)
          document = await TestHelper.submitGetRequest(server, getOptions)
          expect(NotificationService.sendEmail).toBeCalledTimes(2)

          expect(NotificationService.sendEmail).toBeCalledWith(
            EmailTypes.CONFIRMATION_EMAIL,
            false,
            mockApplicantContactDetails.emailAddress,
            {
              exemptionType: ItemType.MUSICAL,
              fullName: mockApplicantContactDetails.name,
              submissionReference
            }
          )

          expect(NotificationService.sendEmail).toBeCalledWith(
            EmailTypes.EMAIL_TO_OWNER,
            undefined,
            mockOwnerContactDetails.emailAddress,
            {
              exemptionType: ItemType.MUSICAL,
              fullName: mockOwnerContactDetails.name,
              submissionReference
            }
          )
        })
      })

      describe('Section 2, applicant is the owner', () => {
        beforeEach(() => {
          _createSection2RedisMock(Options.YES)
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
              fullName: mockOwnerContactDetails.name,
              submissionReference
            }
          )
        })
      })

      describe('Section 2, applicant is NOT the owner', () => {
        beforeEach(() => {
          _createSection2RedisMock(Options.NO)
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
              fullName: mockApplicantContactDetails.name,
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
  name: 'OWNER_NAME',
  emailAddress: 'OWNER@EMAIL.COM',
  confirmEmailAddress: 'OWNER@EMAIL.COM'
}

const mockApplicantContactDetails = {
  name: 'APPLICANT_NAME',
  emailAddress: 'APPLICANT@EMAIL.COM',
  confirmEmailAddress: 'APPLICANT@EMAIL.COM'
}

const redisMockDataMap = {
  [RedisKeys.PAYMENT_ID]: paymentReference,
  [RedisKeys.SUBMISSION_REFERENCE]: submissionReference,
  [RedisKeys.OWNER_CONTACT_DETAILS]: JSON.stringify(mockOwnerContactDetails)
}

const _createMocks = () => {
  TestHelper.createMocks()

  NotificationService.sendEmail = jest.fn()
}

const _createSection2RedisMock = ownedByApplicant => {
  redisMockDataMap[RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT] = ItemType.HIGH_VALUE
  redisMockDataMap[RedisKeys.OWNED_BY_APPLICANT] = ownedByApplicant
  redisMockDataMap[RedisKeys.APPLICANT_CONTACT_DETAILS] = JSON.stringify(
    ownedByApplicant === Options.YES
      ? mockOwnerContactDetails
      : mockApplicantContactDetails
  )

  RedisService.get = jest.fn((request, redisKey) => {
    return redisMockDataMap[redisKey]
  })
}

const _createSection10RedisMock = ownedByApplicant => {
  redisMockDataMap[RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT] = ItemType.MUSICAL
  redisMockDataMap[RedisKeys.OWNED_BY_APPLICANT] = ownedByApplicant
  redisMockDataMap[RedisKeys.APPLICANT_CONTACT_DETAILS] = JSON.stringify(
    ownedByApplicant === Options.YES
      ? mockOwnerContactDetails
      : mockApplicantContactDetails
  )

  RedisService.get = jest.fn((request, redisKey) => {
    return redisMockDataMap[redisKey]
  })
}
