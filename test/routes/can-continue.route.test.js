'use strict'

const TestHelper = require('../utils/test-helper')
const {
  AlreadyCertifiedOptions,
  ItemType,
  RedisKeys
} = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/can-continue route', () => {
  let server
  const url = '/can-continue'
  const nextUrl = '/legal-responsibility'

  const elementIds = {
    pageTitle: 'pageTitle',
    preListHeading: 'preListHeading',
    listHeading: 'listHeading',
    step1: 'step-1',
    step2: 'step-2',
    step3: 'step-3',
    step4: 'step-4',
    step5: 'step-5',
    step6: 'step-6',
    step7: 'step-7',
    timeoutParagraph: 'timeoutParagraph',
    previousOwnerParagraph: 'previousOwnerParagraph',
    finalParagraph: 'finalParagraph',
    cancelLink: 'cancelLink',
    continue: 'continue'
  }

  const section2Description =
    'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
  const section10Description =
    'Musical instrument made before 1975 with less than 20% ivory'

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

    describe('Section 2 (high value items)', () => {
      describe('Used checker', () => {
        beforeEach(async () => {
          RedisService.get = jest.fn((request, redisKey) => {
            const mockDataMap = {
              [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
              [RedisKeys.ALREADY_CERTIFIED]: {
                alreadyCertified: AlreadyCertifiedOptions.NO
              },
              [RedisKeys.REVOKED_CERTIFICATE]: null,
              [RedisKeys.APPLIED_BEFORE]: null,
              [RedisKeys.USED_CHECKER]: true
            }
            return mockDataMap[redisKey]
          })

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now apply for an exemption certificate'
          )
        })

        it('should have the correct pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Based on your answers, you are able to make an application for an exemption certificate for your item as a pre-1918 item of outstandingly high artistic, cultural or historical value.'
          )
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Upload any documents that support your application.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Declare that the item in your opinion meets the relevant exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step6}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £250.'
          )

          element = document.querySelector(`#${elementIds.step7}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `We will aim to respond to your application within ${SLA} working days, if it is going to take longer, we will let you know.`
          )
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should have the correct final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `After you’ve paid for your application, it will be sent to an expert for assessment. We'll aim to let you know the outcome of your application within ${SLA} working days, we'll let you know if it is going to take longer. Once we've received this assessment, we'll decide whether to award the item an exemption certificate. If your application is unsuccessful, we will tell you the reasons why. You cannot deal in this item until it has an exemption certificate.`
          )
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should have the correct "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          TestHelper.checkLink(
            element,
            'Cancel and return to GOV.UK',
            'https://www.gov.uk/guidance/dealing-in-items-containing-ivory-or-made-of-ivory'
          )
        })
      })

      describe('Not used checker', () => {
        beforeEach(async () => {
          RedisService.get = jest.fn((request, redisKey) => {
            const mockDataMap = {
              [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
              [RedisKeys.ALREADY_CERTIFIED]: {
                alreadyCertified: AlreadyCertifiedOptions.NO
              },
              [RedisKeys.REVOKED_CERTIFICATE]: null,
              [RedisKeys.APPLIED_BEFORE]: null,
              [RedisKeys.USED_CHECKER]: false
            }
            return mockDataMap[redisKey]
          })

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now apply for an exemption certificate'
          )
        })

        it('should NOT have the pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Upload any documents that support your application.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Declare that the item in your opinion meets the relevant exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step6}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £250.'
          )

          element = document.querySelector(`#${elementIds.step7}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `We will aim to respond to your application within ${SLA} working days, if it is going to take longer, we will let you know.`
          )
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should have the correct final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `After you’ve paid for your application, it will be sent to an expert for assessment. We'll aim to let you know the outcome of your application within ${SLA} working days, we'll let you know if it is going to take longer. Once we've received this assessment, we'll decide whether to award the item an exemption certificate. If your application is unsuccessful, we will tell you the reasons why. You cannot deal in this item until it has an exemption certificate.`
          )
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should NOT have the "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          expect(element).toBeFalsy()
        })
      })

      describe('Certificate revoked', () => {
        beforeEach(async () => {
          RedisService.get = jest.fn((request, redisKey) => {
            const mockDataMap = {
              [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
              [RedisKeys.ALREADY_CERTIFIED]: {
                alreadyCertified: AlreadyCertifiedOptions.USED_TO
              },
              [RedisKeys.REVOKED_CERTIFICATE]: 'REVOKED_CERT_123',
              [RedisKeys.APPLIED_BEFORE]: null
            }
            return mockDataMap[redisKey]
          })

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now make a new application for an exemption certificate'
          )
        })

        it('should NOT have the pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Upload any documents that support your application.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Declare that the item in your opinion meets the relevant exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step6}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £250.'
          )

          element = document.querySelector(`#${elementIds.step7}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `We will aim to respond to your application within ${SLA} working days, if it is going to take longer, we will let you know.`
          )
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should have the correct final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `After you’ve paid for your application, it will be sent to an expert for assessment. We'll aim to let you know the outcome of your application within ${SLA} working days, we'll let you know if it is going to take longer. Once we've received this assessment, we'll decide whether to award the item an exemption certificate. If your application is unsuccessful, we will tell you the reasons why. You cannot deal in this item until it has an exemption certificate.`
          )
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should NOT have the "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          expect(element).toBeFalsy()
        })
      })

      describe('Applied before', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('false')
            .mockResolvedValueOnce(section2Description)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now make a new application for an exemption certificate'
          )
        })

        it('should NOT have the pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Upload any documents that support your application.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Declare that the item in your opinion meets the relevant exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step6}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £250.'
          )

          element = document.querySelector(`#${elementIds.step7}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `We will aim to respond to your application within ${SLA} working days, if it is going to take longer, we will let you know.`
          )
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should have the correct final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            `After you’ve paid for your application, it will be sent to an expert for assessment. We'll aim to let you know the outcome of your application within ${SLA} working days, we'll let you know if it is going to take longer. Once we've received this assessment, we'll decide whether to award the item an exemption certificate. If your application is unsuccessful, we will tell you the reasons why. You cannot deal in this item until it has an exemption certificate.`
          )
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should NOT have the "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          expect(element).toBeFalsy()
        })
      })

      describe('Already certified (reselling)', () => {
        beforeEach(async () => {
          RedisService.get = jest.fn((request, redisKey) => {
            const mockDataMap = {
              [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.HIGH_VALUE,
              [RedisKeys.ALREADY_CERTIFIED]: {
                alreadyCertified: AlreadyCertifiedOptions.YES,
                certificateNumber: 'CERT_123'
              },
              [RedisKeys.REVOKED_CERTIFICATE]: null,
              [RedisKeys.APPLIED_BEFORE]: { appliedBefore: null }
            }
            return mockDataMap[redisKey]
          })

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Selling your certified item of outstandingly high artistic, cultural or historical value'
          )
        })

        it('should NOT have the pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct previous owner paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.previousOwnerParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'A certificate for this item would have been issued to a previous owner.'
          )
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Confirm the information on the certificate remains accurate and complete.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £20.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Receive confirmation you can now sell or hire out your item.'
          )
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should NOT have the final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should NOT have the "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          expect(element).toBeFalsy()
        })
      })
    })

    describe('Section 10 (non high value items)', () => {
      describe('Used checker', () => {
        beforeEach(async () => {
          RedisService.get = jest.fn((request, redisKey) => {
            const mockDataMap = {
              [RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT]: ItemType.MUSICAL,
              [RedisKeys.ALREADY_CERTIFIED]: {
                alreadyCertified: AlreadyCertifiedOptions.NO
              },
              [RedisKeys.REVOKED_CERTIFICATE]: null,
              [RedisKeys.APPLIED_BEFORE]: null,
              [RedisKeys.USED_CHECKER]: true
            }
            return mockDataMap[redisKey]
          })

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now make a self-declaration to sell or hire out your item'
          )
        })

        it('should have the correct pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Based on your answers, your item may qualify as exempt from the ivory ban.'
          )
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'This is a registration under the Ivory Act, complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Declare that the item in your opinion meets the relevant exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay an administration fee of £20.'
          )

          element = document.querySelector(`#${elementIds.step6}`)
          expect(element).toBeFalsy()
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should NOT have the final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should have the correct "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          TestHelper.checkLink(
            element,
            'Cancel and return to GOV.UK',
            'https://www.gov.uk/guidance/dealing-in-items-containing-ivory-or-made-of-ivory'
          )
        })
      })

      describe('Not used checker', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('false')
            .mockResolvedValueOnce(section10Description)

          document = await TestHelper.submitGetRequest(server, getOptions)
        })

        it('should have the Beta banner', () => {
          TestHelper.checkBetaBanner(document)
        })

        it('should have the Back link', () => {
          TestHelper.checkBackLink(document)
        })

        it('should have the correct page heading', () => {
          const element = document.querySelector(`#${elementIds.pageTitle}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can now make a self-declaration to sell or hire out your item'
          )
        })

        it('should NOT have the pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct list heading', () => {
          const element = document.querySelector(`#${elementIds.listHeading}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'This is a registration under the Ivory Act, complete the process by following the steps below:'
          )
        })

        it('should have the correct list items', () => {
          let element = document.querySelector(`#${elementIds.step1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.step2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.step4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Declare that the item in your opinion meets the relevant exemption criteria.'
          )

          element = document.querySelector(`#${elementIds.step5}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay an administration fee of £20.'
          )

          element = document.querySelector(`#${elementIds.step6}`)
          expect(element).toBeFalsy()
        })

        it('should have the correct timeout paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.timeoutParagraph}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'You can stop half-way through and come back later. We’ll delete your answers if you close your browser or take more than 24 hours to complete the service.'
          )
        })

        it('should NOT have the final paragraph', () => {
          const element = document.querySelector(
            `#${elementIds.finalParagraph}`
          )
          expect(element).toBeFalsy()
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should NOT have the "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          expect(element).toBeFalsy()
        })
      })
    })
  })

  describe('POST', () => {
    let postOptions

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      it('should redirect and save the correct payment amount when it "IS NOT" a S2 (high value) item', async () => {
        RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSICAL)
        await _checkPostAction(postOptions, server, nextUrl, 2000)
      })

      it('should redirect and save the correct payment amount when it "IS" a S2 (high value) item', async () => {
        RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)
        await _checkPostAction(postOptions, server, nextUrl, 25000)
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}

const _checkPostAction = async (
  postOptions,
  server,
  nextUrl,
  expectedAmount
) => {
  const redisKeyPaymentAmount = 'payment-amount'

  expect(RedisService.set).toBeCalledTimes(0)

  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(RedisService.set).toBeCalledTimes(1)
  expect(RedisService.set).toBeCalledWith(
    expect.any(Object),
    redisKeyPaymentAmount,
    expectedAmount
  )

  expect(response.headers.location).toEqual(nextUrl)
}
