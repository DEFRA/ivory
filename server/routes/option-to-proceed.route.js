'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  Analytics,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')

const { buildErrorSummary } = require('../utils/validation')

const {
  proceedWithRegistration,
  _getContext,
  _validateForm
} = require('./common/option-to-proceed')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.OPTION_TO_PROCEED, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    const BAD_REQUEST = 400;

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.OPTION_TO_PROCEED, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(BAD_REQUEST);
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.optionToProceed}`,
      label: context.pageTitle
    })

    if (payload.optionToProceed === proceedWithRegistration) {
      await RedisService.set(
        request,
        RedisKeys.OPTION_TO_PROCEED,
        payload.optionToProceed
      )
      return h.redirect(Paths.WHAT_TYPE_OF_ITEM_IS_IT)
    } else {
      RedisService.delete(request, RedisKeys.OPTION_TO_PROCEED)

      return h.redirect(Paths.DO_NOT_NEED_SERVICE)
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OPTION_TO_PROCEED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OPTION_TO_PROCEED}`,
    handler: handlers.post
  }
]
