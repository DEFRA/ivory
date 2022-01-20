'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../../utils/test-helper.js';

describe('/errors/service-unavailable (503) route', () => {
  let server
  const url = '/errors/service-unavailable'

  const elementIds = {
    pageTitle: 'pageTitle',
    para1: 'para1'
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
      expect(TestHelper.getTextContent(element)).toEqual(
        'Sorry, the service is unavailable'
      )
    })

    it('should have the correct paragraph', () => {
      const element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You will be able to use the service later.'
      )
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
