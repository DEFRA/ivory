'use strict'

const { HOME_URL, Paths, Views, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: _getContext().pageTitle
    })

    return h.view(Views.SESSION_TIMED_OUT, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REDIRECT} ${HOME_URL}`,
      label: _getContext().pageTitle
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
