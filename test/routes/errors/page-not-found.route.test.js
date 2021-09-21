'use strict'

const TestHelper = require('../../utils/test-helper')

describe('/errors/page-not-found (404) route', () => {
  let server
  const url = '/errors/page-not-found'

  const elementIds = {
    pageTitle: 'pageTitle',
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
      expect(TestHelper.getTextContent(element)).toEqual('Page not found')
    })

    it('should have the correct paragraphs', () => {
      let element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you typed the web address, check it is correct.'
      )

      element = document.querySelector(`#${elementIds.para2}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'If you pasted the web address, check you copied the entire address.'
      )
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
