'use strict'

const Hoek = require('@hapi/hoek')

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const { Paths, RedisKeys, Analytics } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const uploadData = await RedisService.get(
      request,
      RedisKeys.UPLOAD_DOCUMENT
    )

    for (const array in uploadData) {
      uploadData[array].splice(
        parseInt(Hoek.escapeHtml(request.params.index)) - 1,
        1
      )
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

module.exports = [
  {
    method: 'GET',
    path: `${Paths.REMOVE_DOCUMENT}/{index}`,
    handler: handlers.get
  }
]
