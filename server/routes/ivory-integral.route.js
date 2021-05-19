'use strict'

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Views } = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IVORY_INTEGRAL)
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_INTEGRAL, {
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    RedisService.set(request, RedisKeys.IVORY_INTEGRAL, payload.ivoryIsIntegral)
    return h.redirect(Paths.UPLOAD_PHOTOS)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.ivoryIsIntegral)) {
    errors.push({
      name: 'ivoryIsIntegral',
      text: 'You must tell us how the ivory is integral to the item'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_INTEGRAL}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_INTEGRAL}`,
    handler: handlers.post
  }
]
