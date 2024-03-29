'use strict'

const AnalyticsService = require('../../services/analytics.service')

const { Paths, Views, Options, Analytics } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (_request, h) => {
    const context = _getContext()

    return h.view(Views.LESS_THAN_10_IVORY, {
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
        .view(Views.LESS_THAN_10_IVORY, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.lessThan10Ivory}`,
      label: context.pageTitle
    })

    switch (payload.lessThan10Ivory) {
      case Options.YES:
        return h.redirect(Paths.MADE_BEFORE_1947)
      case Options.NO:
        return h.redirect(Paths.IS_IT_A_PORTRAIT_MINIATURE)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is your item less than 10% ivory?',
    callOutText:
      'The ivory must be integral to the design or function of the item.',
    helpText:
      'You must give a reasonable assessment of the volume of ivory in your item. In some cases, it’s easy to do this by eye. In others, you’ll need to take measurements.',
    helpText2:
      'If it’s difficult to do this without damaging the item, you can make an assessment based on knowledge of similar items.',
    helpText3:
      'Do not include any empty spaces, for instance, the space within a chest of drawers or a teapot.',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.lessThan10Ivory)) {
    errors.push({
      name: 'lessThan10Ivory',
      text: 'Tell us whether your item is less than 10% ivory'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.LESS_THAN_10_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.LESS_THAN_10_IVORY}`,
    handler: handlers.post
  }
]
