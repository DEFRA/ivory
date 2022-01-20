'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import RedisService from '../../services/redis.service.js';
import { ItemType, Paths, RedisKeys, Views, Options, Analytics } from '../../utils/constants.js';
import { buildErrorSummary, Validators } from '../../utils/validation.js';
import { getStandardOptions } from '../../utils/general.js';

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.IS_IT_A_PORTRAIT_MINIATURE, {
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
        .view(Views.IS_IT_A_PORTRAIT_MINIATURE, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.isItAPortraitMiniature}`,
      label: context.pageTitle
    })

    switch (payload.isItAPortraitMiniature) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.MINIATURE
        )
        return h.redirect(Paths.IS_ITEM_PRE_1918)
      case Options.NO:
        await RedisService.set(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT, '')
        return h.redirect(Paths.IS_ITEM_PRE_1918)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is your item a portrait miniature?',
    helpText:
      'Portrait miniatures are small portraits, popular in the 18th or 19th century, that were often painted on very thin pieces of ivory.',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItAPortraitMiniature)) {
    errors.push({
      name: 'isItAPortraitMiniature',
      text: 'Tell us whether your item is a portrait miniature'
    })
  }
  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.IS_IT_A_PORTRAIT_MINIATURE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_IT_A_PORTRAIT_MINIATURE}`,
    handler: handlers.post
  }
];
