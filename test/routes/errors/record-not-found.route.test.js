'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../../utils/test-helper.js';

describe('/errors/record-not-found (deep link) route', () => {
  let server
  const url = '/errors/record-not-found'

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

    it('should NOT have the Back link', () => {
      TestHelper.checkBackLink(document, false)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Record not found')
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
