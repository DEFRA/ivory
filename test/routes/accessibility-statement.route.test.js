'use strict'

const createServer = require('../../server')

jest.mock('../../server/services/cookie.service')

const TestHelper = require('../utils/test-helper')

describe('/accessibility-statement', () => {
  let server
  const url = '/accessibility-statement'

  const elementIds = {
    pageTitle: 'pageTitle'
  }

  const pageContentIds = [
    'para1',
    'para2',
    'para3',
    'para4',
    'listItem1',
    'listItem2',
    'listItem3',
    'listItem4',
    'listItem5',
    'h2-1',
    'para1-1',
    'listItem1-1',
    'h2-2',
    'para1-2',
    'para2-2',
    'listItem1-2',
    'listItem2-2',
    'h3-2a',
    'para1-2a',
    'h3-2b',
    'para1-2b',
    'h2-3',
    'para1-3',
    'h3-3a',
    'para1-3a',
    'h2-4',
    'para1-4',
    'para2-4'
  ]

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
        'Accessibility statement for ‘Declare elephant ivory you want to sell or hire out’'
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
