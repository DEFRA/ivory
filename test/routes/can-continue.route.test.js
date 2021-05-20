'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType, ServerEvents } = require('../../server/utils/constants')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/ivory-volume route', () => {
  let server
  const url = '/can-continue'

  const elementIds = {
    pageTitle: 'pageTitle',
    additionalStep1: 'additionalStep-1',
    additionalStep2: 'additionalStep-2',
    finalParagraph: 'finalParagraph',
    continue: 'continue'
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
    })

    describe('GET: Has the correct details when it IS a S2 (high value) item', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValue(ItemType.HIGH_VALUE)

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
      it('should redirect', async () => {
        await TestHelper.submitPostRequest(server, postOptions, 302)
      })
    })
  })
})

const _createMocks = () => {
  RedisService.set = jest.fn()
}
