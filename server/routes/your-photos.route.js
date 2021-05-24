'use strict'

const { Paths, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.YOUR_PHOTOS, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.YOUR_PHOTOS, {
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
    pageTitle: 'Your photos'
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
    path: `${Paths.YOUR_PHOTOS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.YOUR_PHOTOS}`,
    handler: handlers.post
  }
]
