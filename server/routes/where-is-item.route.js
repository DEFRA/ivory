'use strict'

const RedisService = require('../services/redis.service')
const { Options, Paths, RedisKeys, Views } = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.WHERE_IS_ITEM, {
      ..._getContext(request)
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.WHERE_IS_ITEM, {
          ..._getContext(request),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.WHERE_IS_ITEM,
      payload.whereIsItem
    )

    return h.redirect(Paths.SALE_INTENTION)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is the item currently in Great Britain?',
    items: [
      {
        value: Options.YES,
        text: Options.YES
      },
      {
        value: Options.NO,
        text: Options.NO
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whereIsItem)) {
    errors.push({
      name: 'whereIsItem',
      text: 'You must tell us if the item is currently in Great Britain'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHERE_IS_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHERE_IS_ITEM}`,
    handler: handlers.post
  }
]
