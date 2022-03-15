'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  Capacities,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../utils/constants')

const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.WHAT_CAPACITY, {
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
        .view(Views.WHAT_CAPACITY, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.whatCapacity}`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.WHAT_CAPACITY,
      JSON.stringify(payload)
    )

    return h.redirect(Paths.APPLICANT_CONTACT_DETAILS)
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.WHAT_CAPACITY)
  }

  const whatCapacity = payload ? payload.whatCapacity : null

  const options = _getOptions(whatCapacity)

  return {
    pageTitle: 'In what capacity are you making this declaration?',
    items: options
  }
}

const _getOptions = whatCapacity => {
  const options = Object.values(Capacities).map(capacity => {
    return {
      label: capacity,
      checked: whatCapacity && whatCapacity === capacity
    }
  })

  return options.map(option => ({
    text: option.label,
    value: option.label,
    checked: option.checked
  }))
}

const _validateForm = payload => {
  const errors = []
  const errorMessage =
    'Tell us in what capacity you are making this declaration'

  if (Validators.empty(payload.whatCapacity)) {
    errors.push({
      name: 'whatCapacity',
      text: errorMessage
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHAT_CAPACITY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHAT_CAPACITY}`,
    handler: handlers.post
  }
]
