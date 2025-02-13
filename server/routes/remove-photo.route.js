'use strict'

const Hoek = require('@hapi/hoek')

const AnalyticsService = require('../services/analytics.service')
const AzureBlobService = require('../services/azure-blob.service')
const RedisService = require('../services/redis.service')

const {
  Analytics,
  AzureContainer,
  Paths,
  RedisKeys
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const index = parseInt(Hoek.escapeHtml(request.params.index)) - 1

    const uploadData = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

    await _removeImageBlob(request, uploadData, index)

    for (const array of Object.values(uploadData)) {
      array.splice(index, 1)
    }

    await RedisService.set(
      request,
      RedisKeys.UPLOAD_PHOTO,
      JSON.stringify(uploadData)
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.PHOTO_REMOVED
    })

    return uploadData.files.length
      ? h.redirect(Paths.YOUR_PHOTOS)
      : h.redirect(Paths.UPLOAD_PHOTO)
  }
}

/**
 * Removes photo from blob storage
 */
const _removeImageBlob = (request, uploadData, index) => {
  const blobName = AzureBlobService.getBlobName(
    request,
    RedisKeys.UPLOAD_PHOTO,
    uploadData.thumbnails[index]
  )

  return AzureBlobService.delete(AzureContainer.Images, blobName)
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.REMOVE_PHOTO}/{index}`,
    handler: handlers.get
  }
]
