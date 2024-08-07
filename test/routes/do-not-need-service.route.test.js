'use strict'

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const TestHelper = require('../utils/test-helper')

describe('Eligibility checker - do not need service route', () => {
  let server
  const url = '/eligibility-checker/do-not-need-service'
  const nextUrl =
    'https://www.gov.uk/guidance/dealing-in-items-containing-ivory-or-made-of-ivory'

  const elementIds = {
    pageTitle: 'pageTitle',
    speciesList: 'speciesList',
    finish: 'finish',
    para1: 'para1',
    para2: 'para2'
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

    describe('GET: Common content', () => {
      beforeEach(async () => {
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document, true)
      })

      it('should display the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You don’t need to tell us about this item'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.finish}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Finish and return to GOV.UK'
        )
      })
    })

    describe('GET: Dynamic content, no species selected', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('None of these')
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should display the correct help text', () => {
        const element = document.querySelector(`#${elementIds.para1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You only need to tell us if you are intending to sell or hire out an item that contains ivory from:'
        )
      })

      it('should display the correct species list', () => {
        let element = document.querySelector(
          `#${elementIds.speciesList} > li:nth-child(1)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('elephant')

        element = document.querySelector(
          `#${elementIds.speciesList} > li:nth-child(2)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('hippopotamus')

        element = document.querySelector(
          `#${elementIds.speciesList} > li:nth-child(3)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('killer whale')

        element = document.querySelector(
          `#${elementIds.speciesList} > li:nth-child(4)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('narwhal')

        element = document.querySelector(
          `#${elementIds.speciesList} > li:nth-child(5)`
        )
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('sperm whale')
      })
    })

    describe('GET: Dynamic content, museum', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('true')
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should display the correct help text', () => {
        const element = document.querySelector(`#${elementIds.para2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Qualifying museums do not need to tell us when they sell or hire out ivory items to each other.'
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
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValueOnce(null)
      })

      it('should progress to the next route', async () => {
        await _checkPostAction(postOptions, server, nextUrl)
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}

const _checkPostAction = async (postOptions, server, nextUrl) => {
  const response = await TestHelper.submitPostRequest(server, postOptions)

  expect(response.headers.location).toEqual(nextUrl)
}
