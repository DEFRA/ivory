'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')
const RedisHelper = require('../../services/redis-helper.service')

const {
  Analytics,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (_request, h) => {
    const context = _getContext()

    return h.view(Views.TAKEN_FROM_ELEPHANT, {
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
        .view(Views.TAKEN_FROM_ELEPHANT, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.takenFromElephant}`,
      label: context.pageTitle
    })

    switch (payload.takenFromElephant) {
      case Options.YES:
        return h.redirect(Paths.CANNOT_TRADE)
      case Options.NO:
        RedisService.set(
          request,
          RedisKeys.ALREADY_CERTIFIED,
          JSON.stringify({ alreadyCertified: Options.NO })
        )

        return h.redirect(
          (await RedisHelper.isSection2(request))
            ? Paths.APPLIED_BEFORE
            : Paths.CAN_CONTINUE
        )
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'Was the replacement ivory taken from an elephant on or after 1 January 1975?',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.takenFromElephant)) {
    errors.push({
      name: 'takenFromElephant',
      text:
        'You must tell us whether the replacement ivory was taken from an elephant on or after 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.TAKEN_FROM_ELEPHANT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.TAKEN_FROM_ELEPHANT}`,
    handler: handlers.post
  }
]
