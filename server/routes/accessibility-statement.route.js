'use strict'

// TODO GA
// const AnalyticsService = require('../services/analytics.service')

const config = require('../utils/config')
const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) =>
    h.view(Views.ACCESSIBILITY_STATEMENT, {
      ..._getContext(request)
    })
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
