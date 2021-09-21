'use strict'

jest.mock('@defra/hapi-gapi')

const fs = require('fs')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

const RedisService = require('../../server/services/redis.service')

describe('/your-documents route', () => {
  let server
  const url = '/your-documents'
  const nextUrl = '/who-owns-the-item'
  const nextUrlUploadDocument = '/upload-document'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    addAnotherDocument: 'addAnotherDocument',
    continue: 'continue'
  }

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

    describe('GET: 0 documents', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockNoData))
      })

      it('should redirect back to the "Upload photo" page if there are no uploaded photos to display', async () => {
        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(response.headers.location).toEqual(nextUrlUploadDocument)
      })
    })

    describe('GET: 6 or less documents', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue(JSON.stringify(mockData))

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
        expect(TestHelper.getTextContent(element)).toEqual('Your documents')
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You can add up to 6 documents.'
        )
      })

      it('should have the "Add another document" link', () => {
        const element = document.querySelector(
          `#${elementIds.addAnotherDocument}`
        )
        TestHelper.checkLink(
          element,
          'Add another document',
          '/upload-document'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: 6 documents', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockDataSixDocuments))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should not have the "Add another document" link', () => {
        const element = document.querySelector(
          `#${elementIds.addAnotherDocument}`
        )
        expect(element).toBeFalsy()
      })
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

        expect(RedisService.set).toBeCalledTimes(0)

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const mockNoData = {
  files: [],
  fileData: [],
  fileSizes: []
}

const mockData = {
  files: ['1.pdf'],
  fileData: ['file-data'],
  fileSizes: [100]
}

const mockDataSixDocuments = {
  files: ['1.pdf', '2.pdf', '3.pdf', '4.pdf', '5.pdf', '6.pdf'],
  fileData: [
    'file-data-1',
    'file-data-2',
    'file-data-3',
    'file-data-4',
    'file-data-5',
    'file-data-6'
  ],
  fileSizes: [100, 200, 300, 400, 500, 600]
}

const _createMocks = () => {
  TestHelper.createMocks()

  fs.writeFileSync = jest.fn()
}
