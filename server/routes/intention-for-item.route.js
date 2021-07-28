'use strict'

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Intention, Views } = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.INTENTION_FOR_ITEM, {
      ..._getContext(request)
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.INTENTION_FOR_ITEM, {
          ..._getContext(request),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.INTENTION_FOR_ITEM,
      payload.intentionForItem
    )

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'What do you intend to do with the item?',
    items: Object.values(Intention).map(intention => {
      return {
        value: intention,
        text: intention
      }
    })
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.intentionForItem)) {
    errors.push({
      name: 'intentionForItem',
      text: 'You must tell us what you intend to do with the item'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.INTENTION_FOR_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.INTENTION_FOR_ITEM}`,
    handler: handlers.post
  }
]
