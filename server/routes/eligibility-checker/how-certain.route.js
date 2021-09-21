'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const { Analytics, Paths, Views, RedisKeys } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const completelyCertain = 'Completely'

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.HOW_CERTAIN, {
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
        .view(Views.HOW_CERTAIN, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.USED_CHECKER,
      payload.howCertain !== completelyCertain
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.howCertain}`,
      label: context.pageTitle
    })

    return h.redirect(
      payload.howCertain === completelyCertain
        ? Paths.WHAT_TYPE_OF_ITEM_IS_IT
        : Paths.CONTAIN_ELEPHANT_IVORY
    )
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'How certain are you that your item is exempt from the ivory ban?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.howCertain)) {
    errors.push({
      name: 'howCertain',
      text:
        'Tell us how certain you are that your item is exempt from the ivory ban'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.post
  }
]
