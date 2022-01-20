'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import { Paths, Views, Urls, Analytics } from '../../utils/constants.js';

const handlers = {
  get: async (request, h) => {
    const context = _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: Analytics.Action.DROPOUT,
      label: context.pageTitle
    })

    return h.view(Views.CANNOT_TRADE, {
      ...context
    })
  },

  post: async (request, h) => {
    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: `${Analytics.Action.SELECTED} Finish and redirect button`,
      label: 'Cannot Trade'
    })

    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = request => {
  const referringUrl = request.headers.referer

  const pageTitle = 'You are not allowed to sell or hire out your item'

  if (referringUrl.includes(Paths.TAKEN_FROM_ELEPHANT)) {
    return {
      pageTitle,
      helpText:
        'Any replacement ivory in your item must have been taken from an elephant before 1 January 1975.'
    }
  } else if (referringUrl.includes(Paths.MADE_BEFORE_1947)) {
    return {
      pageTitle,
      helpText: 'Your item must have been made before 3 March 1947.'
    }
  } else {
    return {
      pageTitle,
      helpText:
        'Your item does not meet any of the ivory ban exemption criteria.'
    }
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.post
  }
];
