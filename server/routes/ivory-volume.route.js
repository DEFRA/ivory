'use strict'

const { Paths, RedisKeys, Views } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const musicalInstrument = false // temporary to deal with dynamic heading if it's a musical instrument until parent page been built

const handlers = {
  get: async (request, h) => {
    return h.view(Views.IVORY_VOLUME, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_VOLUME, {
          ..._getContext(),
          otherChecked: payload.ivoryVolume === 'Other',
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    RedisService.set(request, RedisKeys.IVORY_VOLUME, (payload.ivoryVolume === 'Other')
      ? `${payload.ivoryVolume}: ${payload.otherDetail}`
      : payload.ivoryVolume)

    return h.redirect(Paths.IVORY_AGE)
  }
}

const _getContext = () => {
  const percentage = musicalInstrument ? 20 : 10
  return {
    pageTitle: `How do you know the item has less than ${percentage}% ivory by volume?`
  }
}

const _validateForm = payload => {
  const errors = []
  const errorMessage = 'You must tell us how you know the item’s ivory volume'

  if (Validators.empty(payload.ivoryVolume)) {
    errors.push({
      name: 'ivoryVolume',
      text: errorMessage
    })
  }

  if (payload.ivoryVolume === 'Other' && Validators.empty(payload.otherDetail)) {
    errors.push({
      name: 'otherDetail',
      text: errorMessage
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_VOLUME}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_VOLUME}`,
    handler: handlers.post
  }
]
