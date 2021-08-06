'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

describe('/errors/session-timed-out route', () => {
  let server
  const url = '/errors/session-timed-out'

  const elementIds = {
    pageTitle: 'pageTitle',
    para1: 'para1',
    goToStart: 'go-to-start'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should NOT have the Back link', () => {
      TestHelper.checkBackLink(document, false)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Session timed out')
    })

    it('should have the correct paragraphs', () => {
      const element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Either your session has expired or you have not started at the beginning.'
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.goToStart}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Go to start')
    })
  })
})
