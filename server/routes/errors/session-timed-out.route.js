'use strict'

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.SESSION_TIMED_OUT, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Session timed out'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SESSION_TIMED_OUT}`,
    handler: handlers.get
  }
]
