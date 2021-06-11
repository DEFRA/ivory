'use strict'

const { Paths, Views, Options } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.LESS_THAN_10_IVORY, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.LESS_THAN_10_IVORY, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.lessThan10Ivory) {
      case Options.YES:
        return h.redirect(Paths.MADE_BEFORE_1947)
      case Options.NO:
        return h.redirect(Paths.IS_IT_A_PORTRAIT_MINIATURE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is the item less than 10% ivory?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.lessThan10Ivory)) {
    errors.push({
      name: 'lessThan10Ivory',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.LESS_THAN_10_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.LESS_THAN_10_IVORY}`,
    handler: handlers.post
  }
]
