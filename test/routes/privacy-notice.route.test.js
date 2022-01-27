'use strict'

const TestHelper = require('../utils/test-helper')

describe('/privacy-notice', () => {
  let server
  const url = '/privacy-notice'

  const elementIds = {
    pageTitle: 'pageTitle'
  }

  const pageContentIds = [
    'pageSubTitle',
    'h2-1',
    'h2-2',
    'h2-3',
    'h2-4',
    'h2-5',
    'h2-6',
    'h2-7',
    'h2-8',
    'h2-9',
    'h2-10',
    'h2-11',
    'h2-12',
    'h2-13',
    'h2-14',
    'listItemA1-1',
    'listItemA2-1',
    'listItemA3-1',
    'listItemA4-1',
    'listItemB1-1',
    'listItemB2-1',
    'listItemC1-1',
    'listItemC2-1',
    'listItemC3-1',
    'listItemD1-1',
    'listItemD2-1',
    'listItemD3-1',
    'listItemD4-1',
    'para1-1',
    'para2-1',
    'para3-1',
    'para4-1',
    'para5-1',
    'para6-1',
    'para7-1',
    'para8-1',
    'para9-1',
    'para10-1',
    'para11-1',
    'para12-1',
    'para13-1',
    'para14-1',
    'para15-1',
    'para16-1',
    'para17-1',
    'para18-1',
    'para19-1',
    'para20-1',
    'para21-1',
    'para22-1',
    'para23-1',
    'para24-1',
    'para25-1',
    'para26-1',
    'para27-1',
    'para28-1',
    'para29-1'
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
        'Privacy Notice – Defra and APHA'
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
