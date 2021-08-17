'use strict'

const {
  CharacterLimits,
  ItemType,
  IvoryVolumeReasons,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const MUSICAL_PERCENTAGE = 20
const NON_MUSICAL_PERCENTAGE = 10
const otherReason = 'Other reason'

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
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.IVORY_VOLUME,
      JSON.stringify(payload)
    )

    return h.redirect(Paths.IVORY_AGE)
  }
}

const _getItemType = async request =>
  RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = JSON.parse(
      await RedisService.get(request, RedisKeys.IVORY_VOLUME)
    )
  }

  const ivoryVolume = payload ? payload.ivoryVolume : null

  const itemType = await _getItemType(request)
  const percentage =
    itemType === ItemType.MUSICAL ? MUSICAL_PERCENTAGE : NON_MUSICAL_PERCENTAGE

  return {
    pageTitle: `How do you know the item has less than ${percentage}% ivory by volume?`,
    options: _getOptions(ivoryVolume),
    otherReason:
      payload && payload.ivoryVolume === IvoryVolumeReasons.OTHER_REASON
        ? payload.otherReason
        : null
  }
}

const _getOptions = ivoryVolume => {
  return Object.values(IvoryVolumeReasons).map(reason => {
    return {
      label: reason,
      checked: ivoryVolume && ivoryVolume === reason
    }
  })
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

  if (payload.ivoryVolume === otherReason) {
    if (Validators.empty(payload.otherReason)) {
      errors.push({
        name: 'otherReason',
        text: errorMessage
      })
    }

    if (Validators.maxLength(payload.otherReason, CharacterLimits.Input)) {
      errors.push({
        name: 'otherReason',
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
