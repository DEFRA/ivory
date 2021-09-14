'use strict'

const { Paths, Views, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: _getContext().pageTitle
    })

    return h.view(Views.SERVICE_UNAVAILABLE, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Sorry, the service is unavailable'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_UNAVAILABLE}`,
    handler: handlers.get
  }
]
