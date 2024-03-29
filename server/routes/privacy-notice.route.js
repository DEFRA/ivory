'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: (_request, h) => {
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

const _getContext = () => {
  return {
    pageTitle: 'Dealing in exempted ivory items privacy notice'
  }
}
