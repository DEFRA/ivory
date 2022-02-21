'use strict'

const {
  BlobServiceClient,
  StorageSharedKeyCredential
} = require('@azure/storage-blob')

const { DEFRA_IVORY_SESSION_KEY } = require('../utils/constants')

const config = require('../utils/config')

let sharedKeyCredential
let blobServiceClient

module.exports = class AzureBlobService {
  /**
   * Returns a blob name based on the incoming request session ID, the type of blob (image or document) and the filename
   *
   * @param {*} request
   * @param {*} type
   * @param {*} filename
   * @returns
   */
  static getBlobName (request, type, filename) {
    return `${request.state[DEFRA_IVORY_SESSION_KEY]}.${type}.${filename}`
  }

  /**
   * Gets a blob from Azure storage
   * @param {*} containerName The name of the container in which the blob resides
   * @param {*} blobName The name of the blob to get
   * @returns The blob file
   */
  static async get (containerName, blobName) {
    if (!this.isInitialised) {
      this._initialise()
    }

    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlobClient(blobName)
    const downloadBlockBlobResponse = await blobClient.download()

    return _streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
  }

  /**
   * Stores a blob in Azure storage
   * @param {*} containerName The name of the container in which the blob is to reside
   * @param {*} blobName The name of the blob to use
   * @param {*} value The blob file to be stored in the container
   * @returns
   */
  static async set (containerName, blobName, value) {
    if (!this.isInitialised) {
      this._initialise()
    }

    const containerClient = blobServiceClient.getContainerClient(containerName)

    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    return blockBlobClient.upload(value, value.length)
  }

  /**
   * Removes a blob from Azure storage
   * @param {*} containerName The name of the container in which the blob resides
   * @param {*} blobName The name of the blob to get
   * @returns The blob file
   */
  static async delete (containerName, blobName) {
    if (!this.isInitialised) {
      this._initialise()
    }

    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blobClient = containerClient.getBlobClient(blobName)
    return blobClient.deleteIfExists()
  }

  /**
   * Private method to initialise the connection to Azure blob storage
   */
  static _initialise () {
    sharedKeyCredential = new StorageSharedKeyCredential(
      config.azureStorageAccount,
      config.azureStorageAccountKey
    )

    blobServiceClient = new BlobServiceClient(
      `https://${config.azureStorageAccount}.blob.core.windows.net`,
      sharedKeyCredential
    )

    this.isInitialised = true
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
