'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  AlreadyCertifiedOptions,
  CharacterLimits,
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

    return h.view(Views.ALREADY_CERTIFIED, {
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
        .view(Views.ALREADY_CERTIFIED, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    if (payload.alreadyCertified !== AlreadyCertifiedOptions.YES) {
      delete payload.certificateNumber
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.alreadyCertified}${
        payload.alreadyCertified === AlreadyCertifiedOptions.YES
          ? ' - ' + payload.certificateNumber
          : ''
      }`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.ALREADY_CERTIFIED,
      JSON.stringify(payload)
    )

    switch (payload.alreadyCertified) {
      case AlreadyCertifiedOptions.YES:
        return h.redirect(Paths.CAN_CONTINUE)

      case AlreadyCertifiedOptions.NO:
        return h.redirect(Paths.APPLIED_BEFORE)

      case AlreadyCertifiedOptions.USED_TO:
        return h.redirect(Paths.REVOKED_CERTIFICATE)
    }
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.ALREADY_CERTIFIED)
  }

  const alreadyCertified = payload ? payload.alreadyCertified : null

  const options = _getOptions(alreadyCertified)
  const yesOption = options.shift()

  return {
    pageTitle: 'Does the item already have an exemption certificate?',
    items: options,
    yesOption,
    certificateNumber:
      payload && payload.alreadyCertified === AlreadyCertifiedOptions.YES
        ? payload.certificateNumber
        : null
  }
}

const _getOptions = alreadyCertified => {
  const options = Object.values(AlreadyCertifiedOptions).map(option => {
    return {
      label: option,
      checked: alreadyCertified && alreadyCertified === option
    }
  })

  const items = options.map(option => {
    return {
      text: option.label,
      value: option.label,
      checked: option.checked
    }
  })

  items[2].hint = {
    text: "The certificate has been cancelled or 'revoked'"
  }

  return items
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.alreadyCertified)) {
    errors.push({
      name: 'alreadyCertified',
      text: 'Tell us if the item already has an exemption certificate'
    })
  }

  if (payload.alreadyCertified === AlreadyCertifiedOptions.YES) {
    if (Validators.empty(payload.certificateNumber)) {
      errors.push({
        name: 'certificateNumber',
        text: 'Enter the certificate number'
      })
    }

    // TODO CONFIRM MAX CHARS

    if (
      Validators.maxLength(payload.certificateNumber, CharacterLimits.Input)
    ) {
      errors.push({
        name: 'certificateNumber',
        text: `Enter no more than ${formatNumberWithCommas(
          CharacterLimits.Input
        )} characters`
      })
    }
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.ALREADY_CERTIFIED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.ALREADY_CERTIFIED}`,
    handler: handlers.post
  }
]
