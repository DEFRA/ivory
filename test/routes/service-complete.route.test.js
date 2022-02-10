'use strict'

const { ItemType, Options, RedisKeys } = require('../../server/utils/constants')
const config = require('../../server/utils/config')

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
        _createSection10RedisMock(true)
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
          _createSection2RedisMock(false, true, false)
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
            `If you have not heard from us within ${SLA} working days, you can contact us at IvoryAct@apha.gov.uk. Make sure you have your submission reference number, so we can find your details.`
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
          _createSection2RedisMock(false, true, true)
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

      describe('Section 10', () => {
        describe('Section 10: applicant is the owner', () => {
          beforeEach(() => {
            _createSection10RedisMock(true)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(1)
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection10ApplicantConfirmation,
              mockOwnerContactDetails.emailAddress,
              {
                exemptionType: ItemType.MUSICAL,
                fullName: mockOwnerContactDetails.fullName,
                isMuseum: false,
                submissionReference
              }
            )
          })
        })

        describe('Section 10: applicant is NOT the owner, owner email address available', () => {
          beforeEach(() => {
            _createSection10RedisMock(false, true, ItemType.MUSEUM)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(2)

            // Section 10 - Applicant confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection10ApplicantConfirmation,
              mockApplicantContactDetails.emailAddress,
              {
                exemptionType: ItemType.MUSEUM,
                fullName: mockApplicantContactDetails.fullName,
                isMuseum: true,
                submissionReference
              }
            )

            // Section 10 - Owner confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection10OwnerConfirmation,
              mockOwnerContactDetails.emailAddress,
              {
                exemptionType: ItemType.MUSEUM,
                fullName: mockOwnerContactDetails.fullName,
                submissionReference
              }
            )
          })
        })

        describe('Section 10: applicant is NOT the owner, no owner email address available', () => {
          beforeEach(() => {
            _createSection10RedisMock(false, false, ItemType.MUSEUM)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(1)
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection10ApplicantConfirmation,
              mockApplicantContactDetails.emailAddress,
              {
                exemptionType: ItemType.MUSEUM,
                fullName: mockApplicantContactDetails.fullName,
                isMuseum: true,
                submissionReference
              }
            )
          })
        })
      })

      describe('Section 2', () => {
        describe('Already certified, applicant is the owner', () => {
          beforeEach(() => {
            _createSection2RedisMock(true, false, true)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(1)
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2ResaleApplicantConfirmation,
              mockOwnerContactDetails.emailAddress,
              {
                fullName: mockOwnerContactDetails.fullName,
                certificateNumber
              }
            )
          })
        })

        describe('Already certified, applicant is NOT the owner', () => {
          beforeEach(() => {
            _createSection2RedisMock(false, true, true)
          })

          it('should send 2 confirmation emails', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(2)

            // Section 2 Resale - Applicant confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2ResaleApplicantConfirmation,
              mockApplicantContactDetails.emailAddress,
              {
                fullName: mockApplicantContactDetails.fullName,
                certificateNumber
              }
            )

            // Section 2 Resale - Owner confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2OwnerEmailThirdPartyResale,
              mockOwnerContactDetails.emailAddress,
              {
                fullName: mockOwnerContactDetails.fullName,
                certificateNumber
              }
            )
          })
        })

        describe('Already certified, applicant is NOT the owner, no owner email address available', () => {
          beforeEach(() => {
            _createSection2RedisMock(false, false, true)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(1)
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2ResaleApplicantConfirmation,
              mockApplicantContactDetails.emailAddress,
              {
                fullName: mockApplicantContactDetails.fullName,
                certificateNumber: 'CERTIFICATE_NUMBER'
              }
            )
          })
        })

        describe('NOT already certified, applicant is the owner', () => {
          beforeEach(() => {
            _createSection2RedisMock(true, true, false)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(1)
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2ApplicantConfirmation,
              mockOwnerContactDetails.emailAddress,
              {
                fullName: mockOwnerContactDetails.fullName,
                submissionReference
              }
            )
          })
        })

        describe('NOT already certified, applicant is NOT the owner', () => {
          beforeEach(() => {
            _createSection2RedisMock(false, true, false)
          })

          it('should send 2 confirmation emails', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(2)

            // Section 2 - Applicant confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2ApplicantConfirmation,
              mockApplicantContactDetails.emailAddress,
              {
                fullName: mockApplicantContactDetails.fullName,
                submissionReference
              }
            )

            // Section 2 - Owner confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2OwnerEmailThirdParty,
              mockOwnerContactDetails.emailAddress,
              {
                fullName: mockOwnerContactDetails.fullName,
                submissionReference
              }
            )
          })
        })

        describe('NOT already certified, applicant is NOT the owner, no owner email address available', () => {
          beforeEach(() => {
            _createSection2RedisMock(false, false, false)
          })

          it('should send 1 confirmation email', async () => {
            expect(NotificationService.sendEmail).toBeCalledTimes(0)
            document = await TestHelper.submitGetRequest(server, getOptions)
            expect(NotificationService.sendEmail).toBeCalledTimes(1)

            // Section 2 - Applicant confirmation
            expect(NotificationService.sendEmail).toBeCalledWith(
              config.govNotifyTemplateSection2ApplicantConfirmation,
              mockApplicantContactDetails.emailAddress,
              {
                fullName: mockApplicantContactDetails.fullName,
                submissionReference
              }
            )
          })
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
const certificateNumber = 'CERTIFICATE_NUMBER'

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

const _createSection2RedisMock = (
  isOwnedByApplicant,
  hasOwnerEmail = true,
  isAlreadyCertified = false
) => {
  redisMockDataMap[RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT] = ItemType.HIGH_VALUE
  redisMockDataMap[RedisKeys.ALREADY_CERTIFIED] = {
    alreadyCertified: isAlreadyCertified ? Options.YES : Options.NO,
    certificateNumber: isAlreadyCertified ? certificateNumber : null
  }
  redisMockDataMap[RedisKeys.OWNED_BY_APPLICANT] = isOwnedByApplicant
    ? Options.YES
    : Options.NO
  redisMockDataMap[RedisKeys.APPLICANT_CONTACT_DETAILS] = isOwnedByApplicant
    ? mockOwnerContactDetails
    : mockApplicantContactDetails

  mockOwnerContactDetails.hasEmailAddress = hasOwnerEmail
    ? Options.YES
    : Options.NO

  if (!isOwnedByApplicant) {
    redisMockDataMap[RedisKeys.OWNER_CONTACT_DETAILS] = hasOwnerEmail
      ? mockOwnerContactDetails
      : null
  }

  RedisService.get = jest.fn((request, redisKey) => {
    return redisMockDataMap[redisKey]
  })
}

const _createSection10RedisMock = (
  isOwnedByApplicant,
  hasOwnerEmail = true,
  itemType = ItemType.MUSICAL
) => {
  redisMockDataMap[RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT] = itemType
  redisMockDataMap[RedisKeys.OWNED_BY_APPLICANT] = isOwnedByApplicant
    ? Options.YES
    : Options.NO
  redisMockDataMap[RedisKeys.APPLICANT_CONTACT_DETAILS] = isOwnedByApplicant
    ? mockOwnerContactDetails
    : mockApplicantContactDetails

  if (!isOwnedByApplicant) {
    redisMockDataMap[RedisKeys.OWNER_CONTACT_DETAILS] = hasOwnerEmail
      ? mockOwnerContactDetails
      : null
  }

  RedisService.get = jest.fn((request, redisKey) => {
    return redisMockDataMap[redisKey]
  })
}
