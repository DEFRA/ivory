'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const {
  BehalfOfBusinessOptions,
  BehalfOfNotBusinessOptions
} = require('../utils/constants')

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

    return h.view(Views.SELLING_ON_BEHALF_OF, {
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
        .view(Views.SELLING_ON_BEHALF_OF, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.SELLING_ON_BEHALF_OF,
      payload.sellingOnBehalfOf
    )

    if (
      payload.sellingOnBehalfOf !== BehalfOfBusinessOptions.AN_INDIVIDUAL &&
      payload.sellingOnBehalfOf !== BehalfOfBusinessOptions.ANOTHER_BUSINESS &&
      payload.sellingOnBehalfOf !==
        BehalfOfNotBusinessOptions.FRIEND_OR_RELATIVE &&
      payload.sellingOnBehalfOf !== BehalfOfNotBusinessOptions.A_BUSINESS
    ) {
      // Clear out any owner details that may have been previously entered
      await RedisService.delete(request, RedisKeys.OWNER_CONTACT_DETAILS)
      await RedisService.delete(request, RedisKeys.OWNER_ADDRESS)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.sellingOnBehalfOf}`,
      label: context.pageTitle
    })

    switch (payload.sellingOnBehalfOf) {
      case BehalfOfBusinessOptions.BUSINESS_I_WORK_FOR:
        return h.redirect(Paths.APPLICANT_CONTACT_DETAILS)

      case BehalfOfNotBusinessOptions.OTHER:
      case BehalfOfBusinessOptions.OTHER:
        return h.redirect(Paths.WHAT_CAPACITY)

      default:
        return h.redirect(Paths.OWNER_CONTACT_DETAILS)
    }
  }
}

const _getContext = async request => {
  return {
    pageTitle: 'Who are you selling or hiring out the item on behalf of?',
    items: await _getOptions(request)
  }
}

const _getOptions = async request => {
  const workForABusiness = await RedisService.get(
    request,
    RedisKeys.WORK_FOR_A_BUSINESS
  )

  const sellingOnBehalfOf = await RedisService.get(
    request,
    RedisKeys.SELLING_ON_BEHALF_OF
  )

  const businessOptions = Object.values(BehalfOfBusinessOptions).map(option => {
    return {
      value: option,
      text: option,
      checked: sellingOnBehalfOf === option
    }
  })

  const notBusinessOptions = Object.values(BehalfOfNotBusinessOptions).map(
    option => {
      return {
        value: option,
        text: option,
        checked: sellingOnBehalfOf === option
      }
    }
  )

  return workForABusiness === Options.YES ? businessOptions : notBusinessOptions
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.sellingOnBehalfOf)) {
    errors.push({
      name: 'sellingOnBehalfOf',
      text: 'Tell us who you are selling or hiring out the item on behalf of'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SELLING_ON_BEHALF_OF}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.SELLING_ON_BEHALF_OF}`,
    handler: handlers.post
  }
]
