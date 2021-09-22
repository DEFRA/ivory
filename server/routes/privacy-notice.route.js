'use strict'

const config = require('../utils/config')
const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.PRIVACY_NOTICE, {
      ...context
    })
  }
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
