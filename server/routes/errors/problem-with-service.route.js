'use strict'

const { Paths, Views, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: _getContext().pageTitle
    })

    return h.view(Views.PROBLEM_WITH_SERVICE, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Sorry, there is a problem with the service'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PROBLEM_WITH_SERVICE}`,
    handler: handlers.get
  }
]
