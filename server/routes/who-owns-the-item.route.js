'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import { Options, Paths, Views, RedisKeys, Analytics } from '../utils/constants.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

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
      payload.doYouOwnTheItem
    )

    if (payload.doYouOwnTheItem === Options.YES) {
      await RedisService.delete(request, RedisKeys.WORK_FOR_A_BUSINESS)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.doYouOwnTheItem}`,
      label: context.pageTitle
    })

    return payload.doYouOwnTheItem === Options.YES
      ? h.redirect(Paths.APPLICANT_CONTACT_DETAILS)
      : h.redirect(Paths.WORK_FOR_A_BUSINESS)
  }
}

const _getContext = async request => {
  const doYouOwnTheItem = await RedisService.get(
    request,
    RedisKeys.OWNED_BY_APPLICANT
  )

  return {
    pageTitle: 'Do you own the item?',
    items: [
      {
        value: Options.YES,
        text: Options.YES,
        checked: doYouOwnTheItem === Options.YES
      },
      {
        value: Options.NO,
        text: Options.NO,
        checked: doYouOwnTheItem === Options.NO
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.doYouOwnTheItem)) {
    errors.push({
      name: 'doYouOwnTheItem',
      text: 'Tell us if you own the item'
    })
  }
  return errors
}

export default [
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
];
