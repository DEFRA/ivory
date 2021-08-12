'use strict'

const { HOME_URL, Paths, Views } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.SESSION_TIMED_OUT, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
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
