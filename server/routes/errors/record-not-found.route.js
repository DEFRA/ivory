'use strict'

// TODO analytics
// const AnalyticsService = require('../../services/analytics.service')

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const context = _getContext()

    // AnalyticsService.sendEvent(request, {
    //   category: Analytics.Category.ERROR_PAGE,
    //   action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
    //   label: context.pageTitle
    // })

    return h.view(Views.RECORD_NOT_FOUND, {
      ...context
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Record not found'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.RECORD_NOT_FOUND}`,
    handler: handlers.get
  }
]
