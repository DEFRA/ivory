'use strict'

import Hoek from '@hapi/hoek';

// TODO IVORY-557
// const AnalyticsService = require('../services/analytics.service')
import RedisService from '../services/redis.service.js';

import { Paths, RedisKeys } from '../utils/constants.js';

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

    return uploadData.files.length
      ? h.redirect(Paths.YOUR_DOCUMENTS)
      : h.redirect(Paths.UPLOAD_DOCUMENT)
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.REMOVE_DOCUMENT}/{index}`,
    handler: handlers.get
  }
];
