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

    const uploadData = await RedisService.get(
      request,
      RedisKeys.UPLOAD_DOCUMENT
    )

    await _removeSupportingEvidenceBlob(request, uploadData, index)

    for (const array in uploadData) {
      uploadData[array].splice(index, 1)
    }

    await RedisService.set(
      request,
      RedisKeys.UPLOAD_DOCUMENT,
      JSON.stringify(uploadData)
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.DOCUMENT_REMOVED
    })

    return uploadData.files.length
      ? h.redirect(Paths.YOUR_DOCUMENTS)
      : h.redirect(Paths.UPLOAD_DOCUMENT)
  }
}

/**
 * Removes supporting evidence file from blob storage
 */
const _removeSupportingEvidenceBlob = (request, uploadData, index) => {
  const blobName = AzureBlobService.getBlobName(
    request,
    RedisKeys.UPLOAD_DOCUMENT,
    uploadData.files[index]
  )

  return AzureBlobService.delete(AzureContainer.SupportingEvidence, blobName)
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.REMOVE_DOCUMENT}/{index}`,
    handler: handlers.get
  }
]
