'use strict'

const { Paths, Views, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REFERRED} ${request.headers.referer}`,
      label: _getContext().pageTitle
    })

    return h.view(Views.UPLOAD_TIMEOUT, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.ERROR_PAGE,
      action: `${Analytics.Action.REDIRECT} ${Paths.UPLOAD_PHOTO}`,
      label: _getContext().pageTitle
    })

    return h.redirect(Paths.UPLOAD_PHOTO)
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
