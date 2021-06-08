'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.RMI_AND_PRE_1918, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.RMI_AND_PRE_1918, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.rmiAndPre1918) {
      case 'Yes':
        return h.redirect(Paths.IVORY_ADDED)
      case 'No':
        return h.redirect(Paths.CANNOT_TRADE)
      case 'I dont know':
        return h.redirect(Paths.IVORY_ADDED)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is it a pre-1918 item of outstandingly high artistic, cultural or historical value?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.rmiAndPre1918)) {
    errors.push({
      name: 'rmiAndPre1918',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.RMI_AND_PRE_1918}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.RMI_AND_PRE_1918}`,
    handler: handlers.post
  }
]
