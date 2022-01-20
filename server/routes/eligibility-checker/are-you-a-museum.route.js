'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import RedisService from '../../services/redis.service.js';
import { Analytics, ItemType, Paths, RedisKeys, Views, Options } from '../../utils/constants.js';
import { buildErrorSummary, Validators } from '../../utils/validation.js';
import { getStandardOptions } from '../../utils/general.js';

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.ARE_YOU_A_MUSEUM, {
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
        .view(Views.ARE_YOU_A_MUSEUM, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.ARE_YOU_A_MUSEUM,
      payload.areYouAMuseum === Options.YES
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.areYouAMuseum}`,
      label: context.pageTitle
    })

    if (payload.areYouAMuseum !== Options.YES) {
      await RedisService.set(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
        ItemType.MUSEUM
      )
    }

    return h.redirect(
      payload.areYouAMuseum === Options.YES
        ? Paths.DO_NOT_NEED_SERVICE
        : Paths.CAN_CONTINUE
    )
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Are you selling or hiring the item out on behalf of a museum?',
    helpText:
      'You must be acting on behalf of a museum that is a member of the International Council of Museums, or accredited by one of the following:',
    items: getStandardOptions(false)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.areYouAMuseum)) {
    errors.push({
      name: 'areYouAMuseum',
      text: 'Tell us whether you are acting on behalf of a museum'
    })
  }
  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.ARE_YOU_A_MUSEUM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.ARE_YOU_A_MUSEUM}`,
    handler: handlers.post
  }
];
