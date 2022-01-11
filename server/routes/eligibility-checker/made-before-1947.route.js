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
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.MADE_BEFORE_1947, {
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
        .view(Views.MADE_BEFORE_1947, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.madeBefore1947}`,
      label: context.pageTitle
    })

    switch (payload.madeBefore1947) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.TEN_PERCENT
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
    pageTitle: 'Was your item made before 3 March 1947?',
    helpText: 'The following might help you decide:',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.madeBefore1947)) {
    errors.push({
      name: 'madeBefore1947',
      text: 'Tell us whether your item was made before 3 March 1947'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MADE_BEFORE_1947}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.MADE_BEFORE_1947}`,
    handler: handlers.post
  }
]
