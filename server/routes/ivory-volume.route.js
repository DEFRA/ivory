'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const RedisHelper = require('../services/redis-helper.service')

const {
  CharacterLimits,
  ItemType,
  IvoryVolumeReasons,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../utils/constants')
const {
  formatNumberWithCommas,
  getIvoryVolumePercentage
} = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const otherReason = 'Other reason'

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.IVORY_VOLUME, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.IVORY_VOLUME, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    if (payload.ivoryVolume !== 'Other reason') {
      delete payload.otherReason
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.MAIN_QUESTIONS,
        action: `${Analytics.Action.SELECTED} ${payload.ivoryVolume}`,
        label: context.pageTitle
      })
    } else {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.MAIN_QUESTIONS,
        action: `${Analytics.Action.SELECTED} ${payload.ivoryVolume} - ${payload.otherReason}`,
        label: context.pageTitle
      })
    }

    await RedisService.set(
      request,
      RedisKeys.IVORY_VOLUME,
      JSON.stringify(payload)
    )

    return h.redirect(
      context.itemType === ItemType.TEN_PERCENT
        ? Paths.IVORY_INTEGRAL
        : Paths.IVORY_AGE
    )
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.IVORY_VOLUME)
  }

  const itemType = await RedisHelper.getItemType(request)
  const ivoryVolume = payload ? payload.ivoryVolume : null
  const percentage = getIvoryVolumePercentage(itemType)

  return {
    itemType,
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
