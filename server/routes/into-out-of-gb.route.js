'use strict'

const { Paths, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.INTO_OUT_OF_GB, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.INTO_OUT_OF_GB, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'By selling or hiring out the item, will it move into Great Britain?'
  }

  // Alternative title:
  // By selling or hiring out the item, will it move out of Great Britain?
}

const _validateForm = payload => {
  const errors = []

  // TODO Validation

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.INTO_OUT_OF_GB}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.INTO_OUT_OF_GB}`,
    handler: handlers.post
  }
]
