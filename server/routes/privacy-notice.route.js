'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => h.view(Views.PRIVACY_NOTICE)
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PRIVACY_NOTICE}`,
    handler: handlers.get
  }
]
