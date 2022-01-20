'use strict'
import { jest } from '@jest/globals';
import TestHelper from '../../utils/test-helper.js';

describe('/errors/upload-timeout route', () => {
  let server
  const url = '/errors/upload-timeout'
  const nextUrl = '/upload-photo'

  const elementIds = {
    pageTitle: 'pageTitle',
    para1: 'para1',
    tryAgain: 'tryAgain'
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
        'Your image upload has timed out'
      )
    })

    it('should have the correct help text', () => {
      const element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'This may be due to a slow internet connection.'
      )
    })

    it('should have the correct Call to Action button', () => {
      const element = document.querySelector(`#${elementIds.tryAgain}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Try again')
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
      it('should progress to the next route', async () => {
        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
