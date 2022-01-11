'use strict'

// TODO IVORY-557
// const AnalyticsService = require('../../services/analytics.service')

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const context = _getContext()

    return h.view(Views.RECORD_NOT_FOUND, {
      ...context
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Record not found',
    hideBackLink: true
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.RECORD_NOT_FOUND}`,
    handler: handlers.get
  }
]
