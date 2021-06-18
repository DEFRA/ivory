'use strict'

const { Paths, Views, Options } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CONTAIN_ELEPHANT_IVORY, {
      ..._getContext()
    })
  },

  post: (request, h) => {
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
      case Options.YES:
        return h.redirect(Paths.SELLING_TO_MUSEUM)
      case Options.NO:
        return h.redirect(Paths.DO_NOT_NEED_SERVICE)
      case Options.I_DONT_KNOW:
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
  if (Validators.empty(payload.containElephantIvory)) {
    errors.push({
      name: 'containElephantIvory',
      text: 'You need to select something!'
    })
  }
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