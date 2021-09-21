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

    return h.view(Views.SERVICE_UNAVAILABLE, {
      ...context
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Sorry, the service is unavailable'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_UNAVAILABLE}`,
    handler: handlers.get
  }
]
