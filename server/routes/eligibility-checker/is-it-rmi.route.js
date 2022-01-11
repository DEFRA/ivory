'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  Analytics,
  ItemType,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.IS_IT_RMI, {
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
        .view(Views.IS_IT_RMI, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.isItRmi}`,
      label: context.pageTitle
    })

    if (payload.isItRmi === Options.YES) {
      await RedisService.set(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
        ItemType.HIGH_VALUE
      )
    }

    return h.redirect(
      payload.isItRmi === Options.YES ? Paths.IVORY_ADDED : Paths.CANNOT_TRADE
    )
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'Does your item have outstandingly high artistic, cultural or historical value?',
    helpText:
      'The item must be a rare and socially significant example of its type.',
    callOutText:
      'An item that only has sentimental value would not qualify, regardless of how important it is to you personally.',
    items: getStandardOptions(false)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItRmi)) {
    errors.push({
      name: 'isItRmi',
      text:
        'Tell us whether your item has outstandingly high artistic, cultural or historical value'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_IT_RMI}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_IT_RMI}`,
    handler: handlers.post
  }
]
