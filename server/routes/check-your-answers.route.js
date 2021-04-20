'use strict'

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.CHECK_YOUR_ANSWERS, {
      ivoryIntegral: await RedisService.get(request, RedisKeys.IVORY_INTEGRAL),
      ivoryAdded: await RedisService.get(request, RedisKeys.IVORY_ADDED),
      errorSummaryText: '',
      errorText: false
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    if (!payload.agree) {
      return h.view(Views.CHECK_YOUR_ANSWERS, {
        ivoryIntegral: await RedisService.get(
          request,
          RedisKeys.IVORY_INTEGRAL
        ),
        ivoryAdded: await RedisService.get(request, RedisKeys.IVORY_ADDED),
        errorSummaryText: 'You must agree to the declaration',
        errorText: {
          text: 'You must agree to the declaration'
        }
      })
    } else {
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `/${Paths.CHECK_YOUR_ANSWERS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `/${Paths.CHECK_YOUR_ANSWERS}`,
    handler: handlers.post
  }
]
