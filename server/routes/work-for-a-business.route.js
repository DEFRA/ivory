'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import { Options, Paths, Views, RedisKeys, Analytics } from '../utils/constants.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

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
    const errors = _validateForm(payload)

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
      payload.workForABusiness
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

  return {
    pageTitle:
      'Do you work for a business that is intending to sell or hire out the item?',
    items: [
      {
        value: 'Yes',
        text: 'Yes',
        checked: workForABusiness === Options.YES
      },
      {
        value: 'No',
        text: 'No',
        checked: workForABusiness === Options.NO
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.workForABusiness)) {
    errors.push({
      name: 'workForABusiness',
      text:
        'Tell us whether you work for a business who is selling or hiring out the item'
    })
  }
  return errors
}

export default [
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
];
