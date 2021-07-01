'use strict'

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.PAGE_NOT_FOUND, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Page not found'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PAGE_NOT_FOUND}`,
    handler: handlers.get
  },
  {
    // Catch all route
    method: 'GET',
    path: '/{p*}',
    handler: handlers.get
  }
]
