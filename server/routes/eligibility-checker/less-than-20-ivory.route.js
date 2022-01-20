'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import RedisService from '../../services/redis.service.js';
import { Analytics, ItemType, Options, Paths, RedisKeys, Views } from '../../utils/constants.js';
import { buildErrorSummary, Validators } from '../../utils/validation.js';
import { getStandardOptions } from '../../utils/general.js';

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.LESS_THAN_20_IVORY, {
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
        .view(Views.LESS_THAN_20_IVORY, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.lessThan20Ivory}`,
      label: context.pageTitle
    })

    switch (payload.lessThan20Ivory) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.MUSICAL
        )
        return h.redirect(Paths.IVORY_ADDED)
      case Options.NO:
        return h.redirect(Paths.RMI_AND_PRE_1918)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is the whole item less than 20% ivory?',
    helpText:
      'You must give a reasonable assessment of the volume of ivory in your whole item. In some cases, it’s easy to do this by eye. In others, you’ll need to take measurements.',
    helpText2:
      'If it’s difficult to do this without damaging the item, you can make an assessment based on knowledge of similar items.',
    helpText3:
      'Do not include any empty spaces, for instance the space within a violin or piano.',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.lessThan20Ivory)) {
    errors.push({
      name: 'lessThan20Ivory',
      text: 'Tell us whether your item is less than 20% ivory'
    })
  }
  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.LESS_THAN_20_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.LESS_THAN_20_IVORY}`,
    handler: handlers.post
  }
];
