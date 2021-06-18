'use strict'

const fs = require('fs')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/your-photos route', () => {
  let server
  const url = '/your-photos'
  const nextUrl = '/who-owns-the-item'

  const elementIds = {
    pageTitle: 'pageTitle',
    helpText: 'helpText',
    addAnotherPhoto: 'addAnotherPhoto',
    continue: 'continue'
  }

  let document

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(() => {
    server.stop()
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

    describe('GET: 6 or less photos', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockReturnValue(JSON.stringify(mockData))

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
        TestHelper.checkLink(element, 'Add another photo', '/upload-photos')
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.continue}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual('Continue')
      })
    })

    describe('GET: 6 or less photos', () => {
      beforeEach(async () => {
        RedisService.get = jest
          .fn()
          .mockReturnValue(JSON.stringify(mockDataSixPhotos))

        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should not have the "Add another photo" link', () => {
        const element = document.querySelector(`#${elementIds.addAnotherPhoto}`)
        expect(element).toBeFalsy()
      })
    })
  })

  describe.skip('POST', () => {
    let postOptions

    beforeEach(() => {
      postOptions = {
        method: 'POST',
        url,
        payload: {}
      }
    })

    describe('Success', () => {
      it('should store the images in Redis and progress to the next route', async () => {
        postOptions.payload.files = {
          path:
            '/var/folders/hf/vwnf4tvs7vxczdwf_c5tp8v80000gn/T/1623826020951-45761-36e933b463bc5a94',
          bytes: 37474,
          filename: 'image1.png',
          headers: {
            'content-disposition':
              'form-data; name="files"; filename="image1.png"',
            'content-type': 'image/png'
          }
        }

        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitPostRequest(server, postOptions)

        expect(RedisService.set).toBeCalledTimes(1)

        // TODO
        // expect(RedisService.set).toBeCalledWith(
        //   expect.any(Object),
        //   'upload-photos',
        //   expect.any(Object)
        // )

        expect(response.headers.location).toEqual(nextUrl)
      })
    })
  })
})

const mockData = {
  files: ['1.png'],
  fileData: ['file-data'],
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
  fs.writeFileSync = jest.fn()
}
