'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IVORY_ADDED, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_ADDED, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.ivoryAdded) {
      case 'Yes':
        return h.redirect(Paths.TAKEN_FROM_ELEPHANT)
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
      'Has any ivory been added to the item since 1 January 1975 to repair or restore it?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.ivoryAdded)) {
    errors.push({
      name: 'ivoryAdded',
      text:
        'You must tell us if any ivory has been added to the item since 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_ADDED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_ADDED}`,
    handler: handlers.post
  }
]
