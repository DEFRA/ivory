'use strict'

import { jest } from '@jest/globals';
import TestHelper from '../utils/test-helper.js';

describe('/cookie-policy', () => {
  let server
  const url = '/cookie-policy'

  const elementIds = {
    pageTitle: 'pageTitle'
  }

  const pageContentIds = ['para1', 'para2', 'subHeading', 'para3']

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
      expect(TestHelper.getTextContent(element)).toEqual('Cookies')
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
