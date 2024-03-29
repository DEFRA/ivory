'use strict'

const TestHelper = require('../utils/test-helper')

const { AzureContainer } = require('../../server/utils/constants')

jest.mock('../../server/services/azure-blob.service')
const AzureBlobService = require('../../server/services/azure-blob.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/remove-photo route', () => {
  let server
  const url = '/remove-photo'
  const nextUrlNoPhotos = '/upload-photo'
  const nextUrlYourPhotos = '/your-photos'
  const redisKey = 'upload-photo'

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
      method: 'GET'
    }

    describe('GET: One photo', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue(mockData)
      })

      it('should redirect to the "Upload photos" page', async () => {
        getOptions.url = `${url}/1`

        expect(RedisService.get).toBeCalledTimes(0)
        expect(RedisService.set).toBeCalledTimes(0)

        expect(AzureBlobService.delete).toBeCalledTimes(0)

        const response = await TestHelper.submitGetRequest(
          server,
          getOptions,
          302,
          false
        )

        expect(RedisService.get).toBeCalledTimes(1)
        expect(RedisService.get).toBeCalledWith(expect.any(Object), redisKey)

        expect(AzureBlobService.delete).toBeCalledTimes(1)
        expect(AzureBlobService.delete).toBeCalledWith(
          AzureContainer.Images,
          mockBlobName
        )

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify({
            files: [],
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
        RedisService.get = jest.fn().mockResolvedValue(mockDataSixPhotos)
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

        expect(AzureBlobService.delete).toBeCalledTimes(1)
        expect(AzureBlobService.delete).toBeCalledWith(
          AzureContainer.Images,
          mockBlobName
        )

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify({
            files: mockDataSixPhotos.files.slice(0),
            fileSizes: mockDataSixPhotos.fileSizes.slice(0),
            thumbnails: mockDataSixPhotos.thumbnails.slice(0),
            thumbnailData: mockDataSixPhotos.thumbnailData.slice(0)
          })
        )

        expect(response.headers.location).toEqual(nextUrlYourPhotos)
      })
    })
  })
})

const mockData = {
  files: ['1.png'],
  fileSizes: [100],
  thumbnails: ['1-thumbnail.png'],
  thumbnailData: ['thumbnail-data']
}

const mockDataSixPhotos = {
  files: ['1.png', '2.jpeg', '3.png', '4.jpeg', '5.png', '6.png'],
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

const mockBlobName = 'MOCK_BLOB_NAME'

const _createMocks = () => {
  TestHelper.createMocks()

  AzureBlobService.getBlobName = jest.fn().mockReturnValue(mockBlobName)
  AzureBlobService.delete = jest.fn()
}
