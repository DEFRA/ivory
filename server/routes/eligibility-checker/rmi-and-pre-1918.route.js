'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  ItemType,
  Paths,
  RedisKeys,
  Views,
  Options,
  Analytics
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (_request, h) => {
    const context = _getContext()

    return h.view(Views.RMI_AND_PRE_1918, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.RMI_AND_PRE_1918, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.rmiAndPre1918}`,
      label: context.pageTitle
    })

    switch (payload.rmiAndPre1918) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.HIGH_VALUE
        )
        return h.redirect(Paths.IVORY_ADDED)
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'Is it a pre-1918 item of outstandingly high artistic, cultural or historical value?',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.rmiAndPre1918)) {
    errors.push({
      name: 'rmiAndPre1918',
      text:
        'Tell us whether your item is a pre-1918 item of outstandingly high artistic, cultural or historical value'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.RMI_AND_PRE_1918}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.RMI_AND_PRE_1918}`,
    handler: handlers.post
  }
]
