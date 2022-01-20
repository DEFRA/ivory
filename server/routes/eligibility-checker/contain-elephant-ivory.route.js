'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import RedisService from '../../services/redis.service.js';
import { Options, Paths, RedisKeys, Views, Analytics } from '../../utils/constants.js';
import { buildErrorSummary, Validators } from '../../utils/validation.js';
import { getStandardOptions } from '../../utils/general.js';

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.CONTAIN_ELEPHANT_IVORY, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.CONTAIN_ELEPHANT_IVORY, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.CONTAIN_ELEPHANT_IVORY,
      payload.containElephantIvory
    )

    if (payload.containElephantIvory === Options.NO) {
      await RedisService.set(request, RedisKeys.ARE_YOU_A_MUSEUM, false)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.containElephantIvory}`,
      label: context.pageTitle
    })

    switch (payload.containElephantIvory) {
      case Options.YES:
        return h.redirect(Paths.SELLING_TO_MUSEUM)
      case Options.NO:
        return h.redirect(Paths.DO_NOT_NEED_SERVICE)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Does your item contain elephant ivory?',
    helpText:
      'Any ivory in your item must be ‘worked’ ivory. This means it has been carved or significantly altered from its original raw state in some way.',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.containElephantIvory)) {
    errors.push({
      name: 'containElephantIvory',
      text: 'Tell us whether your item contains elephant ivory'
    })
  }
  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.post
  }
];
