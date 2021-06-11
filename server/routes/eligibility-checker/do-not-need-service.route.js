'use strict'

const { Paths, Views, Urls } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.DO_NOT_NEED_SERVICE, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'You don’t need to tell us about this item'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.post
  }
]
