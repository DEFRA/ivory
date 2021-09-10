'use strict'

const fs = require('fs')

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')

jest.mock('../../server/services/cookie.service')
jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/remove-photo route', () => {
  let server
  const url = '/remove-photo'
  const nextUrlNoPhotos = '/upload-photo'
  const nextUrlYourPhotos = '/your-photos'
  const redisKey = 'upload-photo'

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
      method: 'GET'
    }

    describe('GET: One photo', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue(JSON.stringify(mockData))
      })

      it('should redirect to the "Upload photos" page', async () => {
        getOptions.url = `${url}/1`

        expect(RedisService.get).toBeCalledTimes(0)
        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(RedisService.get).toBeCalledTimes(1)

        expect(RedisService.get).toBeCalledWith(expect.any(Object), redisKey)

        expect(RedisService.set).toBeCalledTimes(1)

        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify({
            files: [],
            fileData: [],
            fileSizes: [],
            thumbnails: [],
            thumbnailData: []
          })
        )

        expect(response.headers.location).toEqual(nextUrlNoPhotos)
      })
    })

    describe('GET: Multiple photos', () => {
      beforeEach(() => {
        RedisService.get = jest
          .fn()
          .mockResolvedValue(JSON.stringify(mockDataSixPhotos))
      })

      it('should redirect to the "Your photos" page', async () => {
        getOptions.url = `${url}/1`

        expect(RedisService.get).toBeCalledTimes(0)
        expect(RedisService.set).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(RedisService.get).toBeCalledTimes(1)

        expect(RedisService.get).toBeCalledWith(expect.any(Object), redisKey)

        expect(RedisService.set).toBeCalledTimes(1)

        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify({
            files: mockDataSixPhotos.files.slice(1),
            fileData: mockDataSixPhotos.fileData.slice(1),
            fileSizes: mockDataSixPhotos.fileSizes.slice(1),
            thumbnails: mockDataSixPhotos.thumbnails.slice(1),
            thumbnailData: mockDataSixPhotos.thumbnailData.slice(1)
          })
        )

        expect(response.headers.location).toEqual(nextUrlYourPhotos)
      })
    })
  })
})

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
    'file-data-1',
    'file-data-2',
    'file-data-3',
    'file-data-4',
    'file-data-5',
    'file-data-6'
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
    'thumbnail-data-1',
    'thumbnail-data-2',
    'thumbnail-data-3',
    'thumbnail-data-4',
    'thumbnail-data-5',
    'thumbnail-data-6'
  ]
}

const _createMocks = () => {
  TestHelper.createMocks()

  fs.writeFileSync = jest.fn()
}
