'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const RedisHelper = require('../services/redis-helper.service')

const {
  Analytics,
  BusinessOrIndividual,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.WORK_FOR_A_BUSINESS, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(context, payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.WORK_FOR_A_BUSINESS, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.WORK_FOR_A_BUSINESS,
      payload.workForABusiness === Options.YES
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.workForABusiness}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.SELLING_ON_BEHALF_OF)
  }
}

const _getContext = async request => {
  const workForABusiness = await RedisService.get(
    request,
    RedisKeys.WORK_FOR_A_BUSINESS
  )

  const isSection2 = await RedisHelper.isSection2(request)

  return {
    isSection2,
    pageTitle: `In what capacity are you completing this ${
      isSection2 ? 'application' : 'registration'
    }?`,
    items: [
      {
        value: Options.YES,
        text: BusinessOrIndividual.AS_A_BUSINESS,
        checked: workForABusiness
      },
      {
        value: Options.NO,
        text: BusinessOrIndividual.AS_AN_INDIVIDUAL,
        checked: workForABusiness !== null && !workForABusiness
      }
    ]
  }
}

const _validateForm = (context, payload) => {
  const errors = []
  if (Validators.empty(payload.workForABusiness)) {
    errors.push({
      name: 'workForABusiness',
      text: `Tell us in what capacity you are completing this ${
        context.isSection2 ? 'application' : 'registration'
      }`
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WORK_FOR_A_BUSINESS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WORK_FOR_A_BUSINESS}`,
    handler: handlers.post
  }
]
