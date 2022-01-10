'use strict'

const AnalyticsService = require('../../services/analytics.service')

const { Paths, Views, Options, Analytics } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.IS_IT_A_MUSICAL_INSTRUMENT, {
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
        .view(Views.IS_IT_A_MUSICAL_INSTRUMENT, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.isItAMusicalInstrument}`,
      label: context.pageTitle
    })

    switch (payload.isItAMusicalInstrument) {
      case Options.YES:
        return h.redirect(Paths.MADE_BEFORE_1975)
      default:
        return h.redirect(Paths.LESS_THAN_10_IVORY)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is your item a musical instrument?',
    helpText:
      'This includes accessories used to play a musical instrument, like a violin bow, although these must be registered as separate items.',
    helpText2: 'This does not include:',
    items: getStandardOptions(false)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItAMusicalInstrument)) {
    errors.push({
      name: 'isItAMusicalInstrument',
      text: 'Tell us whether your item is a musical instrument'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_IT_A_MUSICAL_INSTRUMENT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_IT_A_MUSICAL_INSTRUMENT}`,
    handler: handlers.post
  }
]
