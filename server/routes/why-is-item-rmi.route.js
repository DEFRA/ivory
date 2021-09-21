'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  CharacterLimits,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.WHY_IS_ITEM_RMI, {
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
        .view(Views.WHY_IS_ITEM_RMI, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(request, RedisKeys.WHY_IS_ITEM_RMI, payload.whyRmi)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: payload.whyRmi,
      label: context.pageTitle
    })

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
