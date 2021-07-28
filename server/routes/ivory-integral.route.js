'use strict'

const RedisService = require('../services/redis.service')
const {
  IvoryIntegralReasons,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.IVORY_INTEGRAL, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_INTEGRAL, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.IVORY_INTEGRAL,
      payload.ivoryIsIntegral
    )
    return h.redirect(Paths.UPLOAD_PHOTOS)
  }
}

const _getContext = async request => {
  const ivoryIsIntegral = request.payload
    ? request.payload.ivoryIsIntegral
    : await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)

  return {
    pageTitle: 'How is the ivory integral to the item?',
    options: await _getOptions(ivoryIsIntegral)
  }
}

const _getOptions = ivoryIsIntegral => {
  return Object.values(IvoryIntegralReasons).map(reason => {
    return {
      text: reason,
      value: reason,
      checked: ivoryIsIntegral === reason
    }
  })
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
