'use strict'

const fs = require('fs')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/your-photos route', () => {
  let server
  const url = '/your-photos'
  const nextUrl = '/describe-the-item'
  const nextUrlUploadPhoto = '/upload-photo'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    addAnotherPhoto: 'addAnotherPhoto',
    continue: 'continue'
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

    describe('GET: 0 photos', () => {
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

        expect(response.headers.location).toEqual(nextUrlUploadPhoto)
      })
    })

    describe('GET: 6 or less photos', () => {
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
        expect(TestHelper.getTextContent(element)).toEqual('Your photos')
      })

      it('should have the correct help text', () => {
        const element = document.querySelector(`#${elementIds.helpText}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You can add up to 6 photos.'
        )
      })

      it('should have the "Add another photo" link', () => {
        const element = document.querySelector(`#${elementIds.addAnotherPhoto}`)
        TestHelper.checkLink(element, 'Add another photo', '/upload-photo')
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: 6 photos', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockDataSixPhotos))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should not have the "Add another photo" link', () => {
        const element = document.querySelector(`#${elementIds.addAnotherPhoto}`)
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
  fileSizes: [],
  thumbnails: [],
  thumbnailData: []
}

const mockData = {
  files: ['1.png'],
  fileData: ['file-data'],
  fileSizes: [100],
  thumbnails: ['1-thumbnail.png'],
  thumbnailData: ['thumbnail-data']
}

const mockDataSixPhotos = {
  files: ['1.png', '2.jpeg', '3.png', '4.jpeg', '5.png', '6.png'],
  fileData: [
    'file-data',
    'file-data',
    'file-data',
    'file-data',
    'file-data',
    'file-data'
  ],
  fileSizes: [100, 200, 300, 400, 500, 600],
  thumbnails: [
    '1-thumbnail.png',
    '2-thumbnail.jpeg',
    '3-thumbnail.png',
    '4-thumbnail.jpeg',
    '5-thumbnail.png',
    '6-thumbnail.jpeg'
  ],
  thumbnailData: [
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data',
    'thumbnail-data'
  ]
}

const _createMocks = () => {
  TestHelper.createMocks()

  fs.writeFileSync = jest.fn()
}
