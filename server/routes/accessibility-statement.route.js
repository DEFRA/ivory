'use strict'

// TODO GA
// const AnalyticsService = require('../services/analytics.service')

const config = require('../utils/config')
const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
    const context = _getContext(request)

    return h.view(Views.ACCESSIBILITY_STATEMENT, {
      ...context
    })
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.ACCESSIBILITY_STATEMENT}`,
    handler: handlers.get
  }
]

const _getContext = request => {
  return {
    pageTitle: `Accessibility statement for ‘${config.serviceName}’`,
    serviceName: config.serviceName
  }
}
