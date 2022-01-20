'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import RedisService from '../../services/redis.service.js';
import { Analytics, Options, Paths, RedisKeys, Urls, Views } from '../../utils/constants.js';

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: Analytics.Action.DROPOUT,
      label: context.pageTitle
    })

    return h.view(Views.DO_NOT_NEED_SERVICE, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: `${Analytics.Action.SELECTED} Finish and redirect button`,
      label: context.pageTitle
    })

    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = async request => {
  const isMuseum = await RedisService.get(request, RedisKeys.ARE_YOU_A_MUSEUM)

  const notContainingIvory =
    (await RedisService.get(request, RedisKeys.CONTAIN_ELEPHANT_IVORY)) ===
    Options.NO

  return {
    pageTitle: 'You don’t need to tell us about this item',
    isMuseum,
    notContainingIvory
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.post
  }
];
