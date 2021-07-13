'use strict'

const RedisService = require('../services/redis.service')
const {
  CharacterLimits,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.WHY_IS_ITEM_RMI, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.WHY_IS_ITEM_RMI, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(request, RedisKeys.WHY_IS_ITEM_RMI, payload.whyRmi)

    return h.redirect(Paths.IVORY_AGE)
  }
}

const _getContext = async request => {
  const whyRmi = await RedisService.get(request, RedisKeys.WHY_IS_ITEM_RMI)

  return {
    pageTitle:
      'Why is your item of outstandingly high artistic, cultural or historical value?',
    whyRmi
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whyRmi)) {
    errors.push({
      name: 'whyRmi',
      text:
        'You must explain why your item is of outstandingly high artistic, cultural or historical value'
    })
  } else if (Validators.maxLength(payload.whyRmi, CharacterLimits.Textarea)) {
    errors.push({
      name: 'whyRmi',
      text: `Your description must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Textarea
      )} characters`
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHY_IS_ITEM_RMI}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHY_IS_ITEM_RMI}`,
    handler: handlers.post
  }
]
