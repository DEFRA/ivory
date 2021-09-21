'use strict'

const AnalyticsService = require('../../services/analytics.service')

const { HOME_URL, Paths, Views, Analytics } = require('../../utils/constants')

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

module.exports = [
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
]
