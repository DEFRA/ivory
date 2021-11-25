'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const { Paths, RedisKeys, Views, Analytics } = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

// TODO CONFIRM MAX CHARS
const MAX_LENGTH = 10

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.PREVIOUS_APPLICATION_NUMBER, {
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
        .view(Views.PREVIOUS_APPLICATION_NUMBER, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.previousApplicationNumber}`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.PREVIOUS_APPLICATION_NUMBER,
      payload.previousApplicationNumber
    )

    return h.redirect(Paths.CAN_CONTINUE)
  }
}

const _getContext = async request => {
  let previousApplicationNumber
  if (request.payload) {
    previousApplicationNumber = request.payload.previousApplicationNumber
  } else {
    previousApplicationNumber = await RedisService.get(
      request,
      RedisKeys.PREVIOUS_APPLICATION_NUMBER
    )
  }

  return {
    pageTitle: 'Enter the submission reference for the previous application',
    previousApplicationNumber,
    maxLength: MAX_LENGTH
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.previousApplicationNumber)) {
    errors.push({
      name: 'previousApplicationNumber',
      text: 'Enter the application number for the previous application'
    })
  }

  if (Validators.maxLength(payload.previousApplicationNumber, MAX_LENGTH)) {
    errors.push({
      name: 'previousApplicationNumber',
      text: `The application number should be ${formatNumberWithCommas(
        MAX_LENGTH
      )} characters long`
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PREVIOUS_APPLICATION_NUMBER}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.PREVIOUS_APPLICATION_NUMBER}`,
    handler: handlers.post
  }
]
