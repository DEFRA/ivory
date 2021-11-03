'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  // CharacterLimits,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

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

    console.log(payload)

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
      payload
    )

    return h.redirect(Paths.CAN_CONTINUE)
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(
      request,
      RedisKeys.PREVIOUS_APPLICATION_NUMBER
    )
  }

  const previousApplicationNumber = payload
    ? payload.previousApplicationNumber
    : null

  return {
    pageTitle: 'Enter the submission reference for the previous application',
    previousApplicationNumber
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

  // TODO CONFIRM MAX CHARS
  const maxLenth = 10
  if (
    Validators.maxLength(
      payload.previousApplicationNumber,
      maxLenth
      // CharacterLimits.Input
    )
  ) {
    errors.push({
      name: 'previousApplicationNumber',
      text: `The application number should be ${formatNumberWithCommas(
        // CharacterLimits.Input
        maxLenth
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
