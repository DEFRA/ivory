'use strict'

const {
  CharacterLimits,
  ItemType,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.IVORY_VOLUME, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_VOLUME, {
          ...(await _getContext(request)),
          otherChecked: payload.ivoryVolume === 'Other',
          otherText: payload.otherDetail ? payload.otherDetail : '',
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.IVORY_VOLUME,
      payload.ivoryVolume === 'Other'
        ? `${payload.ivoryVolume}: ${payload.otherDetail}`
        : payload.ivoryVolume
    )

    return h.redirect(Paths.IVORY_AGE)
  }
}

const _getItemType = async request => {
  return await RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
}

const _getContext = async request => {
  const itemType = await _getItemType(request)
  const percentage = itemType === ItemType.MUSICAL ? 20 : 10
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

  if (payload.ivoryVolume === 'Other') {
    if (Validators.empty(payload.otherDetail)) {
      errors.push({
        name: 'otherDetail',
        text: errorMessage
      })
    }

    if (Validators.maxLength(payload.otherDetail, CharacterLimits.Input)) {
      errors.push({
        name: 'otherDetail',
        text: `Enter no more than ${formatNumberWithCommas(
          CharacterLimits.Input
        )} characters`
      })
    }
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
