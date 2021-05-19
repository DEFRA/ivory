'use strict'

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Views } = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.YES_NO_IDK, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.YES_NO_IDK, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    if (payload.yesNoIdk === 'No') {
      await RedisService.set(request, RedisKeys.IVORY_ADDED, 'No')
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }

    if (payload.yesNoIdk === 'I dont know') {
      return 'Game over man...game over!'
    }

    if (payload.yesNoIdk === 'Yes') {
      return h.redirect(Paths.TAKEN_FROM_ELEPHANT)
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
  if (Validators.empty(payload.yesNoIdk)) {
    errors.push({
      name: 'yesNoIdk',
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
