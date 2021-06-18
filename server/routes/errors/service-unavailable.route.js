'use strict'

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.SERVICE_UNAVAILABLE, {
      ..._getContext()
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
