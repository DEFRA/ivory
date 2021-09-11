'use strict'

const config = require('../utils/config')
const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) =>
    h.view(Views.PRIVACY_NOTICE, {
      ..._getContext(request)
    })
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PRIVACY_NOTICE}`,
    handler: handlers.get
  }
]

const _getContext = request => {
  return {
    pageTitle: `Privacy notice: ${config.serviceName}`
  }
}
