'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import { IvoryIntegralReasons, Paths, RedisKeys, Views, Analytics } from '../utils/constants.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.IVORY_INTEGRAL, {
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
        .view(Views.IVORY_INTEGRAL, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.IVORY_INTEGRAL,
      payload.ivoryIsIntegral
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.ivoryIsIntegral}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.IVORY_AGE)
  }
}

const _getContext = async request => {
  const ivoryIsIntegral = request.payload
    ? request.payload.ivoryIsIntegral
    : await RedisService.get(request, RedisKeys.IVORY_INTEGRAL)

  return {
    pageTitle: 'How is the ivory integral to the item?',
    options: _getOptions(ivoryIsIntegral)
  }
}

const _getOptions = ivoryIsIntegral => {
  return Object.values(IvoryIntegralReasons).map(reason => {
    return {
      text: reason,
      value: reason,
      checked: ivoryIsIntegral === reason
    }
  })
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.ivoryIsIntegral)) {
    errors.push({
      name: 'ivoryIsIntegral',
      text: 'You must tell us how the ivory is integral to the item'
    })
  }
  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.IVORY_INTEGRAL}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_INTEGRAL}`,
    handler: handlers.post
  }
];
