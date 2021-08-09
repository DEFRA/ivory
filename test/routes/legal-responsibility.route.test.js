'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ItemType } = require('../../server/utils/constants')

jest.mock('../../server/services/cookie.service')
const CookieService = require('../../server/services/cookie.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/legal-responsibility route', () => {
  let server
  const url = '/legal-responsibility'
  const nextUrlDescribeTheItem = '/describe-the-item'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpTextPara1: 'helpTextPara-1',
    helpTextPara2: 'helpTextPara-2',
    callOutText: 'callOutText',
    cancelLink: 'cancelLink',
    continue: 'continue'
  }

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
          'The item’s owner is legally responsible for the information you’re about to give'
        )
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Stop at any point if you’re unsure about the right answer.'
        )
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'This is a self-assessment, so the owner is responsible for ensuring the item is exempt.'
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If we later find out that the item is not exempt, the item’s owner could be fined or prosecuted.'
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
          'Cancel',
          'https://www.gov.uk/government/consultations/uk-ivory-ban-implementing-the-ivory-act-2018'
        )
      })
    })

    describe('GET: Has the correct details when it IS a S2 (high value) item', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'The person doing this application is legally responsible for the information in it'
        )
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpTextPara1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If you’re acting on behalf of someone else, you must be certain that the information is accurate.'
        )
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpTextPara2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Stop at any point if you’re unsure about the right answer.'
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If we later find out that the information you’ve given is not accurate, you could be fined or prosecuted.'
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
        const response = await TestHelper.submitPostRequest(server, postOptions)
        expect(response.headers.location).toEqual(nextUrlDescribeTheItem)
      })
    })
  })
})

const _createMocks = () => {
  CookieService.checkSessionCookie = jest
    .fn()
    .mockReturnValue('THE_SESSION_COOKIE')

  RedisService.set = jest.fn()
}
