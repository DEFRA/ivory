'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  Options,
  Paths,
  Views,
  RedisKeys,
  Analytics
} = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.SHARE_DETAILS_OF_ITEM, {
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
        .view(Views.SHARE_DETAILS_OF_ITEM, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.SHARE_DETAILS_OF_ITEM,
      payload.shareDetailsOfItem
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.shareDetailsOfItem}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.MAKE_PAYMENT)
  }
}

const _getContext = async request => {
  const shareDetailsOfItem = await RedisService.get(
    request,
    RedisKeys.SHARE_DETAILS_OF_ITEM
  )

  return {
    pageTitle: 'Help our experts by allowing us to share details of your item',
    items: [
      {
        value: Options.YES,
        text: Options.YES,
        checked: shareDetailsOfItem === Options.YES
      },
      {
        value: Options.NO,
        text: Options.NO,
        checked: shareDetailsOfItem === Options.NO
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.shareDetailsOfItem)) {
    errors.push({
      name: 'shareDetailsOfItem',
      text:
        'You must tell us whether you agree to us sharing details of your application with the Prescribed Institutions'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SHARE_DETAILS_OF_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.SHARE_DETAILS_OF_ITEM}`,
    handler: handlers.post
  }
]
