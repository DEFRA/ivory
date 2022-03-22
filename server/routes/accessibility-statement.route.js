'use strict'

const { Paths, Views, SERVICE_NAME } = require('../utils/constants')

const handlers = {
  get: (_request, h) => {
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
    pageTitle: `Accessibility statement for the Ivory Act 2018, ‘${SERVICE_NAME}’`,
    serviceName: SERVICE_NAME
  }
}
