'use strict'

const { Paths, Views, Urls } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CANNOT_CONTINUE, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'You cannot continue'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CANNOT_CONTINUE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_CONTINUE}`,
    handler: handlers.post
  }
]
