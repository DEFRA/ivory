'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/ivory-volume route', () => {
  let server
  const url = '/can-continue'
  const nextUrl = '/legal-responsibility'

  const elementIds = {
    pageTitle: 'pageTitle',
    listHeading: 'listHeading',
    listItem1: 'listItem-1',
    listItem2: 'listItem-2',
    listItem3: 'listItem-3',
    additionalStep1: 'additionalStep-1',
    additionalStep2: 'additionalStep-2',
    finalParagraph: 'finalParagraph',
    cancelLink: 'cancelLink',
    continue: 'continue'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(() => {
    server.stop()
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

    describe('GET: Has the correct details when it is NOT a S2 (high value) item', () => {
      beforeEach(async () => {
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

      it('should have the correct list heading', () => {
        const element = document.querySelector(`#${elementIds.listHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('You’ll need to:')
      })

      it('should have the correct list item', () => {
        const element = document.querySelector(`#${elementIds.listItem1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'describe the item and how it meets the exemption criteria'
        )
      })

      it('should have the correct list item', () => {
        const element = document.querySelector(`#${elementIds.listItem2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'upload some photos of it'
        )
      })

      it('should have the correct list item', () => {
        const element = document.querySelector(`#${elementIds.listItem3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'provide contact details'
        )
      })

      it('should have the correct list item', () => {
        const element = document.querySelector(`#${elementIds.additionalStep1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'pay an administration fee of £20'
        )
      })

      it('should have the correct final paragraph', () => {
        const element = document.querySelector(`#${elementIds.finalParagraph}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'As soon as you successfully make the payment, you’ll be able to sell the item or hire it out.'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })

      it('should have the correct "Cancel" link', () => {
        const element = document.querySelector(`#${elementIds.cancelLink}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Cancel')
        expect(element.href).toEqual('/')
      })
    })

    describe('GET: Has the correct details when it IS a S2 (high value) item', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockReturnValue(ItemType.HIGH_VALUE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You must now apply for an exemption certificate'
        )
      })

      it('should have the correct list item', () => {
        const element = document.querySelector(`#${elementIds.additionalStep1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'pay a non-refundable administration fee of £250'
        )
      })

      it('should have the correct list item', () => {
        const element = document.querySelector(`#${elementIds.additionalStep2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'wait 30 days for your application to be approved by an expert'
        )
      })

      it('should have the correct final paragraph', () => {
        const element = document.querySelector(`#${elementIds.finalParagraph}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If your application is successful, we will send you an exemption certificate so you can sell or hire out your item.'
        )
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
        RedisService.get = jest.fn().mockReturnValue(ItemType.MUSICAL)
        await _checkPostAction(
          postOptions,
          server,
          nextUrl,
          2000
        )
      })

      it('should redirect and save the correct payment amount when it "IS" a S2 (high value) item', async () => {
        RedisService.get = jest.fn().mockReturnValue(ItemType.HIGH_VALUE)
        await _checkPostAction(
          postOptions,
          server,
          nextUrl,
          25000
        )
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
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
