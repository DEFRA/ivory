'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisHelper = require('../../services/redis-helper.service')

const {
  Analytics,
  ItemType,
  Options,
  Paths,
  Views
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (_request, h) => {
    const context = _getContext()

    return h.view(Views.IS_ITEM_PRE_1918, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()
    const payload = request.payload
    const errors = _validateForm(payload)

    const itemType = await RedisHelper.getItemType(request)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.IS_ITEM_PRE_1918, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.isItemPre1918}`,
      label: context.pageTitle
    })

    switch (payload.isItemPre1918) {
      case Options.YES:
        if (itemType === ItemType.MINIATURE) {
          return h.redirect(Paths.LESS_THAN_320CM_SQUARED)
        } else {
          return h.redirect(Paths.IS_IT_RMI)
        }
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was your item made before 1 January 1918?',
    helpText: 'The following might help you decide:',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItemPre1918)) {
    errors.push({
      name: 'isItemPre1918',
      text: 'Tell us whether your item was made before 1918'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_ITEM_PRE_1918}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_ITEM_PRE_1918}`,
    handler: handlers.post
  }
]
