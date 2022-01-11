'use strict'

const AnalyticsService = require('../../services/analytics.service')

const { Paths, Views, Options, Analytics } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.MADE_BEFORE_1975, {
      ...context
    })
  },

  post: (request, h) => {
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
        .view(Views.MADE_BEFORE_1975, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.madeBefore1975}`,
      label: context.pageTitle
    })

    switch (payload.madeBefore1975) {
      case Options.YES:
        return h.redirect(Paths.LESS_THAN_20_IVORY)
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was your item made before 1 January 1975?',
    helpText: 'The following might help you decide:',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.madeBefore1975)) {
    errors.push({
      name: 'madeBefore1975',
      text: 'Tell us whether your item was made before 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MADE_BEFORE_1975}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.MADE_BEFORE_1975}`,
    handler: handlers.post
  }
]
