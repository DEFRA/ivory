'use strict'

const TestHelper = require('../utils/test-helper')

describe('/privacy-notice', () => {
  let server
  const url = '/privacy-notice'

  const elementIds = {
    pageTitle: 'pageTitle'
  }

  const pageContentIds = [
    'h2-1',
    'para1-1',
    'para2-1',
    'para3-1',
    'para4-1',
    'listItemA1-1',
    'listItemA2-1',
    'listItemA1-1',
    'listItemA2-1',
    'h2-2',
    'para1-2',
    'para2-2',
    'para3-2',
    'para4-2',
    'h2-3',
    'para1-3',
    'para2-3',
    'h2-4',
    'para1-4',
    'para2-4',
    'h2-5',
    'para1-5',
    'para2-5',
    'h2-6',
    'para1-6',
    'para2-6',
    'para3-6',
    'listItemA1-6',
    'listItemA2-6',
    'listItemB1-6',
    'listItemB2-6',
    'listItemB3-6',
    'h2-7',
    'para1-7',
    'h2-8',
    'para1-8',
    'para2-8',
    'listItemA1-8',
    'listItemA2-8',
    'h2-9',
    'para1-9',
    'listItemA1-9',
    'listItemA2-9'
  ]

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
      expect(TestHelper.getTextContent(element)).toEqual(
        'Privacy notice: Declare elephant ivory you intend to sell or hire out'
      )
    })

    it('should have the correct content', () => {
      pageContentIds.forEach(element => {
        expect(document.querySelector(`#${element}`)).toBeTruthy()
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
