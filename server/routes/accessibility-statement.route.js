'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.ACCESSIBILITY_STATEMENT)
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.ACCESSIBILITY_STATEMENT}`,
    handler: handlers.get
  }
]
