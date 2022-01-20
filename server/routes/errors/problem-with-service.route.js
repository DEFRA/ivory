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

    return h.view(Views.PROBLEM_WITH_SERVICE, {
      ...context
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Sorry, there is a problem with the service'
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.PROBLEM_WITH_SERVICE}`,
    handler: handlers.get
  }
];
