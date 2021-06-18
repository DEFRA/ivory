'use strict'

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const uploadData = JSON.parse(
      await RedisService.get(request, RedisKeys.UPLOAD_PHOTOS)
    )

    for (const array in uploadData) {
      uploadData[array].splice(parseInt(request.params.index) - 1, 1)
    }

    await RedisService.set(
      request,
      RedisKeys.UPLOAD_PHOTOS,
      JSON.stringify(uploadData)
    )

    return uploadData.files.length
      ? h.redirect(Paths.YOUR_PHOTOS)
      : h.redirect(Paths.UPLOAD_PHOTOS)
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.REMOVE_PHOTO}/{index}`,
    handler: handlers.get
  }
]
