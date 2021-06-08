'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.TAKEN_FROM_ELEPHANT, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.TAKEN_FROM_ELEPHANT, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.takenFromElephant) {
      case 'Yes':
        return h.redirect(Paths.CANNOT_TRADE)
      case 'No':
        return h.redirect(Paths.CAN_CONTINUE)
      case 'I dont know':
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'Was the replacement ivory taken from the elephant on or after 1 January 1975?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.takenFromElephant)) {
    errors.push({
      name: 'takenFromElephant',
      text:
        'You must tell us if the replacement ivory was taken from an elephant on or after 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.TAKEN_FROM_ELEPHANT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.TAKEN_FROM_ELEPHANT}`,
    handler: handlers.post
  }
]
