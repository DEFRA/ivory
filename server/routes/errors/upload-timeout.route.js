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

    return h.view(Views.UPLOAD_TIMEOUT, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REDIRECT} ${Paths.UPLOAD_PHOTO}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.UPLOAD_PHOTO)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Your image upload has timed out'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_TIMEOUT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_TIMEOUT}`,
    handler: handlers.post
  }
]
