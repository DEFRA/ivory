'use strict'

const createServer = require('../../../server')

const TestHelper = require('../../utils/test-helper')

describe('/errors/problem-with-service (500) route', () => {
  let server
  const url = '/errors/problem-with-service'

  const elementIds = {
    pageTitle: 'pageTitle',
    para1: 'para1',
    para2: 'para2'
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

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Sorry, there is a problem with the service'
      )
    })

    it('should have the correct paragraph', () => {
      const element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Try again later.')
    })
  })
})
