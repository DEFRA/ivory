'use strict'

const { Paths, Views, Options } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.SELLING_TO_MUSEUM, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.SELLING_TO_MUSEUM, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.sellingToMuseum) {
      case Options.YES:
        return h.redirect(Paths.ARE_YOU_A_MUSEUM)
      case Options.NO:
        return h.redirect(Paths.IS_IT_A_MUSICAL_INSTRUMENT)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.IS_IT_A_MUSICAL_INSTRUMENT)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Are you selling or hiring the item out to a museum?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.sellingToMuseum)) {
    errors.push({
      name: 'sellingToMuseum',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SELLING_TO_MUSEUM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.SELLING_TO_MUSEUM}`,
    handler: handlers.post
  }
]
