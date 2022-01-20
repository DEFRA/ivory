'use strict'

import AnalyticsService from '../../services/analytics.service.js';
import { Paths, Views, Analytics } from '../../utils/constants.js';

const handlers = {
  get: async (request, h) => {
    const context = _getContext()

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: context.pageTitle
    })

    return h.view(Views.PAGE_NOT_FOUND, {
      ...context
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Page not found'
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.PAGE_NOT_FOUND}`,
    handler: handlers.get
  }
];
