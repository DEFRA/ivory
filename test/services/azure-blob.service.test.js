'use strict'

const AzureBlobService = require('../../server/services/azure-blob.service')

const { RedisKeys } = require('../../server/utils/constants')

let mockRequest
const sessionId = 'the-session-id'

describe('AzureBlob service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getBlobName method', () => {
    it('should return an image blob name', async () => {
      const filename = 'THE_FILENAME'

      const blobName = AzureBlobService.getBlobName(
        mockRequest,
        RedisKeys.UPLOAD_PHOTO,
        filename
      )

      expect(blobName).toEqual(
        `${sessionId}.${RedisKeys.UPLOAD_PHOTO}.${filename}`
      )
    })
  })

  describe('get method', () => {
    it.skip('should retrieve a blob from blob storage', () => {
      // TODO
      // AzureBlobService.get()
    })
  })

  describe('set method', () => {
    it.skip('should save a blob into blob storage', () => {
      // TODO
      // AzureBlobService.set()
    })
  })

  describe('delete method', () => {
    it.skip('should remove a blob from blob storage', () => {
      // TODO
      // AzureBlobService.delete()
    })
  })
})

const _createMocks = () => {
  mockRequest = jest.fn()
  mockRequest.state = {
    DefraIvorySession: sessionId
  }
}
