'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) =>
    h.view(Views.COOKIE_POLICY, {
      ..._getContext(request)
    })
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.COOKIE_POLICY}`,
    handler: handlers.get
  }
]

const _getContext = request => {
  return {
    pageTitle: 'Cookies'
  }
}
