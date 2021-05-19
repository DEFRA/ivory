'use strict'

const { Paths, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.WHY_IS_ITEM_RMI, {
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

    return h.redirect(Paths.IVORY_AGE)
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'Why is your item of outstandingly high artistic, cultural or historical value?'
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
    path: `${Paths.WHY_IS_ITEM_RMI}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHY_IS_ITEM_RMI}`,
    handler: handlers.post
  }
]
