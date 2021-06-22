'use strict'

const { Paths, Views, Options } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.LESS_THAN_320CM_SQUARED, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.LESS_THAN_320CM_SQUARED, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.lessThan320cmSquared) {
      case Options.YES:
        return h.redirect(Paths.IVORY_ADDED)
      case Options.NO:
        return h.redirect(Paths.IS_IT_RMI)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Does the portrait miniature have an ivory surface area of less than 320 square centimetres?',
    helpText: 'Only measure the parts of the portrait you can see. Do not include the frame or areas covered by the frame.',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.lessThan320cmSquared)) {
    errors.push({
      name: 'lessThan320cmSquared',
      text: 'Tell us whether your portrait miniature has an ivory surface area of less than 320 square centimetres'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.LESS_THAN_320CM_SQUARED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.LESS_THAN_320CM_SQUARED}`,
    handler: handlers.post
  }
]
