'use strict'

const { Paths, Views } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.UPLOAD_TIMEOUT, {
      ..._getContext()
    })
  },
  post: (request, h) => {
    return h.redirect(Paths.UPLOAD_PHOTOS)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Your image upload has timed out'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_TIMEOUT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_TIMEOUT}`,
    handler: handlers.post
  }
]
