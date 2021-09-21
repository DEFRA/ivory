'use strict'

jest.mock('@defra/hapi-gapi')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

const RedisService = require('../../server/services/redis.service')

describe('/ivory-volume route', () => {
  let server
  const url = '/can-continue'
  const nextUrl = '/legal-responsibility'

  const elementIds = {
    pageTitle: 'pageTitle',
    preListHeading: 'preListHeading',
    listHeading: 'listHeading',
    listItem1: 'listItem-1',
    listItem2: 'listItem-2',
    additionalStep1: 'additionalStep-1',
    additionalStep2: 'additionalStep-2',
    additionalStep3: 'additionalStep-3',
    additionalStep4: 'additionalStep-4',
    timeoutParagraph: 'timeoutParagraph',
    finalParagraph: 'finalParagraph',
    cancelLink: 'cancelLink',
    continue: 'continue'
  }

  const section2Description =
    'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
  const section10Description =
    'Musical instrument made before 1975 with less than 20% ivory'

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

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    describe('Section 2 (high value items)', () => {
      describe('Used checker', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('true')
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
            'You can now apply for an exemption certificate'
          )
        })

        it('should have the correct pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Based on your answers, it sounds like your item is exempt from the ivory ban.'
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
          let element = document.querySelector(`#${elementIds.listItem1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.listItem2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )
        })

        it('should have the correct additional list items', () => {
          let element = document.querySelector(`#${elementIds.additionalStep1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Upload any documents that support your application.'
          )

          element = document.querySelector(`#${elementIds.additionalStep2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.additionalStep3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £250.'
          )

          element = document.querySelector(`#${elementIds.additionalStep4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Wait 30 days for your application to be approved by an expert.'
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
            'After you’ve paid for your application, you’ll need to wait up to 30 days for it to be approved by an expert. If it is successful, we’ll send you an exemption certificate so you can sell or hire out your item.'
          )
        })

        it('should have the correct Call to Action button', () => {
          const element = document.querySelector(`#${elementIds.continue}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual('Continue')
        })

        it('should have the correct "Cancel" link', () => {
          const element = document.querySelector(`#${elementIds.cancelLink}`)
          TestHelper.checkLink(element, 'Cancel', 'https://www.gov.uk/')
        })
      })

      describe('Not used checker', () => {
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
            'You must now apply for an exemption certificate'
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
          let element = document.querySelector(`#${elementIds.listItem1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.listItem2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )
        })

        it('should have the correct additional list items', () => {
          let element = document.querySelector(`#${elementIds.additionalStep1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Upload any documents that support your application.'
          )

          element = document.querySelector(`#${elementIds.additionalStep2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.additionalStep3}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay a non-refundable administration fee of £250.'
          )

          element = document.querySelector(`#${elementIds.additionalStep4}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Wait 30 days for your application to be approved by an expert.'
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
            'After you’ve paid for your application, you’ll need to wait up to 30 days for it to be approved by an expert. If it is successful, we’ll send you an exemption certificate so you can sell or hire out your item.'
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
    })

    describe('Section 10 (non high value items)', () => {
      describe('Used checker', () => {
        beforeEach(async () => {
          RedisService.get = jest
            .fn()
            .mockResolvedValueOnce('true')
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
            'You can now make a self-assessment to sell or hire out your item'
          )
        })

        it('should have the correct pre-list heading', () => {
          const element = document.querySelector(
            `#${elementIds.preListHeading}`
          )
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Based on your answers, it sounds like your item is exempt from the ivory ban.'
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
          let element = document.querySelector(`#${elementIds.listItem1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.listItem2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )
        })

        it('should have the correct additional list items', () => {
          let element = document.querySelector(`#${elementIds.additionalStep1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.additionalStep2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay an administration fee of £20.'
          )

          element = document.querySelector(`#${elementIds.additionalStep3}`)
          expect(element).toBeFalsy()

          element = document.querySelector(`#${elementIds.additionalStep4}`)
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
          TestHelper.checkLink(element, 'Cancel', 'https://www.gov.uk/')
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
            'You must now make a self-assessment to sell or hire out your item'
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
          let element = document.querySelector(`#${elementIds.listItem1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Add up to 6 photos of the item.'
          )

          element = document.querySelector(`#${elementIds.listItem2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Describe the item and how it meets the exemption criteria.'
          )
        })

        it('should have the correct additional list items', () => {
          let element = document.querySelector(`#${elementIds.additionalStep1}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Provide contact details.'
          )

          element = document.querySelector(`#${elementIds.additionalStep2}`)
          expect(element).toBeTruthy()
          expect(TestHelper.getTextContent(element)).toEqual(
            'Pay an administration fee of £20.'
          )

          element = document.querySelector(`#${elementIds.additionalStep3}`)
          expect(element).toBeFalsy()

          element = document.querySelector(`#${elementIds.additionalStep4}`)
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
