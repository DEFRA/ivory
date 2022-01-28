'use strict'

const config = require('../utils/config')
const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

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

const _getContext = () => {
  return {
    pageTitle: `Accessibility statement for the Ivory Act 2018, ‘${config.serviceName}’`,
    serviceName: config.serviceName
  }
}
