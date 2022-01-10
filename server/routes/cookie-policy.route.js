'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const context = _getContext()

    return h.view(Views.COOKIE_POLICY, {
      ...context
    })
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.COOKIE_POLICY}`,
    handler: handlers.get
  }
]

const _getContext = () => {
  return {
    pageTitle: 'Cookies'
  }
}
