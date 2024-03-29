'use strict'

const TestHelper = require('../utils/test-helper')

const { AzureContainer } = require('../../server/utils/constants')

jest.mock('../../server/services/azure-blob.service')
const AzureBlobService = require('../../server/services/azure-blob.service')

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')

describe('/remove-document route', () => {
  let server
  const url = '/remove-document'
  const nextUrlNoDocuments = '/upload-document'
  const nextUrlYourDocuments = '/your-documents'
  const redisKey = 'upload-document'

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

    describe('GET: One document', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue(mockData)
      })

      it('should redirect to the "Upload documents" page', async () => {
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
          AzureContainer.SupportingEvidence,
          mockBlobName
        )

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify({
            files: [],
            fileSizes: []
          })
        )

        expect(response.headers.location).toEqual(nextUrlNoDocuments)
      })
    })

    describe('GET: Multiple documents', () => {
      beforeEach(() => {
        RedisService.get = jest.fn().mockResolvedValue(mockDataSixPhotos)
      })

      it('should redirect to the "Your supporting evidence" page', async () => {
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
          AzureContainer.SupportingEvidence,
          mockBlobName
        )

        expect(RedisService.set).toBeCalledTimes(1)
        expect(RedisService.set).toBeCalledWith(
          expect.any(Object),
          redisKey,
          JSON.stringify({
            files: mockDataSixPhotos.files.slice(0),
            fileSizes: mockDataSixPhotos.fileSizes.slice(0)
          })
        )

        expect(response.headers.location).toEqual(nextUrlYourDocuments)
      })
    })
  })
})

const mockData = {
  files: ['1.pdf'],
  fileSizes: [100]
}

const mockDataSixPhotos = {
  files: ['1.pdf', '2.pdf', '3.pdf', '4.pdf', '5.pdf', '6.pdf'],
  fileSizes: [100, 200, 300, 400, 500, 600]
}

const mockBlobName = 'MOCK_BLOB_NAME'

const _createMocks = () => {
  TestHelper.createMocks()

  AzureBlobService.getBlobName = jest.fn().mockReturnValue(mockBlobName)
  AzureBlobService.delete = jest.fn()
}
