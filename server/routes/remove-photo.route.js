'use strict'

const Hoek = require('@hapi/hoek')

// TODO GA
// const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const { Paths, RedisKeys } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const uploadData = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

    for (const array in uploadData) {
      uploadData[array].splice(
        parseInt(Hoek.escapeHtml(request.params.index)) - 1,
        1
      )
    }

    await RedisService.set(
      request,
      RedisKeys.UPLOAD_PHOTO,
      JSON.stringify(uploadData)
    )

    return uploadData.files.length
      ? h.redirect(Paths.YOUR_PHOTOS)
      : h.redirect(Paths.UPLOAD_PHOTO)
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.REMOVE_PHOTO}/{index}`,
    handler: handlers.get
  }
]
