'use strict'

import Hoek from '@hapi/hoek';

// TODO IVORY-557
// const AnalyticsService = require('../services/analytics.service')
import RedisService from '../services/redis.service.js';

import { Paths, RedisKeys } from '../utils/constants.js';

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

export default [
  {
    method: 'GET',
    path: `${Paths.REMOVE_PHOTO}/{index}`,
    handler: handlers.get
  }
];
