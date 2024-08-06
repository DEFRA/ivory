'use strict'

jest.mock('../../../server/services/redis.service')
const RedisService = require('../../../server/services/redis.service')
const TestHelper = require('../../utils/test-helper')

const { Options } = require('../../../server/utils/constants')

describe('/eligibility-checker/cannot-continue route', () => {
  let server
  const url = '/eligibility-checker/cannot-continue'
  const nextUrl =
    'https://www.gov.uk/guidance/dealing-in-items-containing-ivory-or-made-of-ivory'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText1a: 'helpText1a',
    helpText1b: 'helpText1b',
    callOutText: 'callOutText',
    heading2: 'heading2',
    helpText2: 'helpText2',
    helpTextList: 'helpTextList',
    continue: 'continue'
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

    describe('GET: Common functionality', () => {
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
          'You cannot continue'
        )
      })

      it('should have the correct call out text', () => {
        const element = document.querySelector(`#${elementIds.callOutText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You may need to get an expert to check it for you, such as an antiques dealer or auctioneer that specialises in ivory.'
        )
      })

      it('should have the correct heading2', () => {
        const element = document.querySelector(`#${elementIds.heading2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'What you can do with this item'
        )
      })

      it('should have the correct help text 2', () => {
        const element = document.querySelector(`#${elementIds.helpText2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'In the meantime, your options include:'
        )
      })

      it('should have a help text list', () => {
        const element = document.querySelector(`#${elementIds.helpTextList}`)
        expect(element).toBeTruthy()
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Finish and return to GOV.UK'
        )
      })
    })

    describe('GET: Contains Ivory - Yes', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(Options.YES)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpText1a}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'To use this service, you must know for sure whether your item qualifies for exemption.'
        )

        element = document.querySelector(`#${elementIds.helpText1b}`)
        expect(element).toBeFalsy()
      })
    })

    describe('GET: Contains Ivory - No', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(Options.No)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpText1a}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'To use this service, you must know for sure whether your item qualifies for exemption.'
        )

        element = document.querySelector(`#${elementIds.helpText1b}`)
        expect(element).toBeFalsy()
      })
    })

    describe('GET: Contains Ivory - Unknown', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(Options.I_DONT_KNOW)
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the correct help text', () => {
        let element = document.querySelector(`#${elementIds.helpText1a}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'To use this service, you must know for sure whether your item contains elephant ivory.'
        )

        element = document.querySelector(`#${elementIds.helpText1b}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'If you’re uncertain about your item and you choose to declare it anyway, we’ll assume it does contain elephant ivory.'
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
        await _checkPostAction(postOptions, server, nextUrl)
      })
    })
  })
})

const _checkPostAction = async (postOptions, server, nextUrl) => {
  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}

const _createMocks = () => {
  TestHelper.createMocks()
}
