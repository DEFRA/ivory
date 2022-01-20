'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import { Paths, RedisKeys, Intention, Views, Analytics } from '../utils/constants.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.INTENTION_FOR_ITEM, {
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
        .view(Views.INTENTION_FOR_ITEM, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.INTENTION_FOR_ITEM,
      payload.intentionForItem
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.intentionForItem}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = async request => {
  return {
    pageTitle: 'What do you intend to do with the item?',
    items: await _getOptions(request)
  }
}

const _getOptions = async request => {
  const intentionForItem = await RedisService.get(
    request,
    RedisKeys.INTENTION_FOR_ITEM
  )

  return Object.values(Intention).map(intention => {
    return {
      value: intention,
      text: intention,
      checked: intention === intentionForItem
    }
  })
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.intentionForItem)) {
    errors.push({
      name: 'intentionForItem',
      text: 'You must tell us what you intend to do with the item'
    })
  }

  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.INTENTION_FOR_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.INTENTION_FOR_ITEM}`,
    handler: handlers.post
  }
];
