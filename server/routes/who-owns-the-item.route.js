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

    return h.view(Views.WHO_OWNS_ITEM, {
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
        .view(Views.WHO_OWNS_ITEM, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.OWNED_BY_APPLICANT,
      payload.whoOwnsItem === 'I own it' ? Options.YES : Options.NO
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.whoOwnsItem}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.OWNER_CONTACT_DETAILS)
  }
}

const _getContext = async request => {
  const whoOwnsItem = await RedisService.get(
    request,
    RedisKeys.OWNED_BY_APPLICANT
  )

  return {
    pageTitle: 'Who owns the item?',
    items: [
      {
        value: 'I own it',
        text: 'I own it',
        checked: whoOwnsItem === Options.YES
      },
      {
        value: 'Someone else owns it',
        text: 'Someone else owns it',
        checked: whoOwnsItem === Options.NO
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.whoOwnsItem)) {
    errors.push({
      name: 'whoOwnsItem',
      text: 'Tell us who owns the item'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHO_OWNS_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHO_OWNS_ITEM}`,
    handler: handlers.post
  }
]
