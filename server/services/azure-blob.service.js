'use strict'

const {
  BlobServiceClient,
  StorageSharedKeyCredential
} = require('@azure/storage-blob')

const config = require('../utils/config')

const sharedKeyCredential = new StorageSharedKeyCredential(
  config.azureStorageAccount,
  config.azureStorageAccountKey
)

const blobServiceClient = new BlobServiceClient(
  `https://${config.azureStorageAccount}.blob.core.windows.net`,
  sharedKeyCredential
)

module.exports = class AzureBlobService {
  /**
   * Gets a blob from Azure storage
   * @param {*} containerName The name of the container in which the blob resides
   * @param {*} blobName The name of the blob to get
   * @returns The blob file
   */
  static async get (containerName, blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlobClient(blobName)
    const downloadBlockBlobResponse = await blobClient.download()

    const blob = await _streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody
    )

    return blob
  }

  /**
   * Stores a blob in Azure storage
   * @param {*} containerName The name of the container in which the blob is to reside
   * @param {*} blobName The name of the blob to use
   * @param {*} value The blob file to be stored in the container
   * @returns
   */
  static async set (containerName, blobName, value) {
    const containerClient = blobServiceClient.getContainerClient(containerName)

    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    return blockBlobClient.upload(value, value.length)
  }
}

/**
 * A helper method used to read a readable stream into a Buffer
 * @param {*} readableStream
 * @returns a Buffer
 */
async function _streamToBuffer (readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', data => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data))
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}
