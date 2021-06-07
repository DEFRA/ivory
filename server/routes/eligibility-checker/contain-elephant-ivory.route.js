'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CONTAIN_ELEPHANT_IVORY, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CONTAIN_ELEPHANT_IVORY, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.containElephantIvory) {
      case 'Yes':
        return h.redirect(Paths.CHECK_YOUR_ANSWERS)
      case 'No':
        return h.redirect(Paths.DO_NOT_NEED_SERVICE)
      case 'I dont know':
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Does your item contain elephant ivory?'
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
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.post
  }
]
