'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import { HOME_URL, Paths, Views, Analytics } from '../../utils/constants.js';

const handlers = {
  get: async (request, h) => {
    const context = _getContext()

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: context.pageTitle
    })

    return h.view(Views.SESSION_TIMED_OUT, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REDIRECT} ${HOME_URL}`,
      label: context.pageTitle
    })

    return h.redirect(HOME_URL)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Session timed out',
    hideBackLink: true
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.SESSION_TIMED_OUT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.SESSION_TIMED_OUT}`,
    handler: handlers.post
  }
];
