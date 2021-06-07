'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CANNOT_TRADE, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CANNOT_TRADE, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.redirect('https://www.gov.uk/')
  }
}

const _getContext = () => {
  return {
    pageTitle: 'You are not allowed to sell or hire out your item'
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
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.post
  }
]
