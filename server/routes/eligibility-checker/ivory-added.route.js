'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisHelper = require('../../services/redis-helper.service')

const { Analytics, Options, Paths, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.IVORY_ADDED, {
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
        .view(Views.IVORY_ADDED, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.ivoryAdded}`,
      label: context.pageTitle
    })

    switch (payload.ivoryAdded) {
      case Options.YES:
        return h.redirect(Paths.TAKEN_FROM_ELEPHANT)

      case Options.NO:
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
      'Has any ivory been added since 1 January 1975 to restore the item to its original state?',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.ivoryAdded)) {
    errors.push({
      name: 'ivoryAdded',
      text:
        'You must tell us if any ivory has been added to the item since 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_ADDED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_ADDED}`,
    handler: handlers.post
  }
]
