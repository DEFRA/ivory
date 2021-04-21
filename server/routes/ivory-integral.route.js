'use strict'

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Views } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
    return h
      .view(Views.IVORY_INTEGRAL, {
        errorSummaryText: '',
        errorText: false
      })
      .code(200)
  },

  post: (request, h) => {
    const payload = request.payload
    if (payload.ivoryIsIntegral) {
      RedisService.set(
        request,
        RedisKeys.IVORY_INTEGRAL,
        payload.ivoryIsIntegral
      )
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }

    return h
      .view(Views.IVORY_INTEGRAL, {
        errorSummaryText:
          'You must tell us how the ivory is integral to the item',
        errorText: {
          text: 'You must tell us how the ivory is integral to the item'
        }
      })
      .code(400)
  }
}

module.exports = [
  {
    method: 'GET',
    path: `/${Paths.IVORY_INTEGRAL}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `/${Paths.IVORY_INTEGRAL}`,
    handler: handlers.post
  }
]
