'use strict'

const { Paths, Views, Options } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IS_IT_A_MUSICAL_INSTRUMENT, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IS_IT_A_MUSICAL_INSTRUMENT, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.isItAMusicalInstrument) {
      case Options.YES:
        return h.redirect(Paths.MADE_BEFORE_1975)
      case Options.NO:
        return h.redirect(Paths.LESS_THAN_10_IVORY)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is your item a musical instrument?',
    helpText: 'This includes accessories used to play a musical instrument, like a violin bow, although these must be registered as separate items.',
    helpText2: 'This does not include:',
    items: getStandardOptions(false)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItAMusicalInstrument)) {
    errors.push({
      name: 'isItAMusicalInstrument',
      text: 'Tell us whether your item is a musical instrument'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_IT_A_MUSICAL_INSTRUMENT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_IT_A_MUSICAL_INSTRUMENT}`,
    handler: handlers.post
  }
]
