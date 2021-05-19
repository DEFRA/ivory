'use strict'

const { Paths, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.UPLOAD_PHOTOS, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.UPLOAD_PHOTOS, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.redirect(Paths.WHO_OWNS_ITEM)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Add up to 6 photos of your item'
  }
}

const _validateForm = payload => {
  const errors = []

  // TODO Validation

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_PHOTOS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_PHOTOS}`,
    handler: handlers.post
  }
]
