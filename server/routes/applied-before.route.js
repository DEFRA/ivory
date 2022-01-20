'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import { Options, Paths, Views, RedisKeys, Analytics } from '../utils/constants.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.APPLIED_BEFORE, {
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
        .view(Views.APPLIED_BEFORE, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.APPLIED_BEFORE,
      payload.appliedBefore
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.appliedBefore}`,
      label: context.pageTitle
    })

    return h.redirect(
      payload.appliedBefore === Options.YES
        ? Paths.PREVIOUS_APPLICATION_NUMBER
        : Paths.CAN_CONTINUE
    )
  }
}

const _getContext = async request => {
  const appliedBefore = await RedisService.get(
    request,
    RedisKeys.APPLIED_BEFORE
  )

  return {
    pageTitle:
      'Has an application for an exemption certificate for this item been made before?',
    items: [
      {
        value: 'Yes',
        text: 'Yes',
        checked: appliedBefore === Options.YES
      },
      {
        value: 'No',
        text: 'No',
        checked: appliedBefore === Options.NO
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.appliedBefore)) {
    errors.push({
      name: 'appliedBefore',
      text: 'Tell us if an application has been made before for this item'
    })
  }
  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.APPLIED_BEFORE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.APPLIED_BEFORE}`,
    handler: handlers.post
  }
];
