'use strict'

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CANNOT_TRADE, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    return h.redirect('https://www.gov.uk/')
  }
}

const _getContext = () => {
  return {
    pageTitle: 'You are not allowed to sell or hire out your item'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.post
  }
]
