'use strict'

const { Paths, Views, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: _getContext().pageTitle
    })

    return h.view(Views.PAGE_NOT_FOUND, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Page not found'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PAGE_NOT_FOUND}`,
    handler: handlers.get
  },
  {
    // Catch all route
    method: 'GET',
    path: '/{p*}',
    handler: handlers.get
  }
]
