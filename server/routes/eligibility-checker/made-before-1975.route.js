'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.MADE_BEFORE_1975, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.MADE_BEFORE_1975, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.madeBefore1975) {
      case 'Yes':
        return h.redirect(Paths.LESS_THAN_20_IVORY)
      case 'No':
        return h.redirect(Paths.CANNOT_TRADE)
      case 'I dont know':
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was the item made before 1 January 1975?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.madeBefore1975)) {
    errors.push({
      name: 'madeBefore1975',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MADE_BEFORE_1975}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.MADE_BEFORE_1975}`,
    handler: handlers.post
  }
]
