'use strict'

const createServer = require('../../../server')

jest.mock('../../../server/services/cookie.service')

const TestHelper = require('../../utils/test-helper')

describe('/eligibility-checker/cannot-trade route', () => {
  let server
  const url = '/eligibility-checker/cannot-trade'
  const nextUrl = 'https://www.gov.uk/'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    helpText2: 'helpText2',
    heading2: 'heading2',
    helpText3: 'helpText3',
    helpTextList: 'helpTextList',
    heading22: 'heading2-2',
    helpText4: 'helpText4',
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
      url,
      headers: {
        referer: ''
      }
    }

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
        'You are not allowed to sell or hire out your item'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Your item does not meet any of the ivory ban exemption criteria.'
      )
    })

    it('should have the correct help text 2', () => {
      const element = document.querySelector(`#${elementIds.helpText2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Based on your answers, it is illegal to sell it, hire it out or exchange it for goods or services.'
      )
    })

    it('should have the correct heading2', () => {
      const element = document.querySelector(`#${elementIds.heading2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'What you can do with this item'
      )
    })

    it('should have the correct help text 3', () => {
      const element = document.querySelector(`#${elementIds.helpText3}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Your options include:'
      )
    })

    it('should have a help text list', () => {
      const element = document.querySelector(`#${elementIds.helpTextList}`)
      expect(element).toBeTruthy()
    })

    it('should have the correct heading22', () => {
      const element = document.querySelector(`#${elementIds.heading22}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'When it may become exempt'
      )
    })

    it('should have the correct help text 4', () => {
      const element = document.querySelector(`#${elementIds.helpText4}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If a museum is interested in your item, you may be able to sell or hire it out to them. In this case, you should try and declare it again.'
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.continue}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Finish and return to GOV.UK'
      )
    })
  })

  describe('GET when referred by /eligibility-checker/taken-from-elephant', () => {
    const getOptions = {
      method: 'GET',
      url,
      headers: {
        referer: '/eligibility-checker/taken-from-elephant'
      }
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the correct help text when referrer is /eligibility-checker/taken-from-elephant', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Any replacement ivory in your item must have been taken from an elephant before 1 January 1975.'
      )
    })
  })

  describe('GET when referred by /eligibility-checker/made-before-1947', () => {
    const getOptions = {
      method: 'GET',
      url,
      headers: {
        referer: '/eligibility-checker/made-before-1947'
      }
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the correct help text when referrer is /eligibility-checker/made-before-1947', () => {
      const element = document.querySelector(`#${elementIds.helpText}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Your item must have been made before 3 March 1947.'
      )
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
