'use strict'

const AnalyticsService = require('../../services/analytics.service')

const { Paths, Views, Analytics } = require('../../utils/constants')

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

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PAGE_NOT_FOUND}`,
    handler: handlers.get
  },
  {
    // Catch all route
    method: 'GET',
    path: '/{p*}',
    handler: handlers.get
  }
]
