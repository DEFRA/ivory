'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.SERVICE_COMPLETE, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Service complete'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
