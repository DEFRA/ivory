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

  post: (request, h) => {
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
      RedisService.set(request, RedisKeys.IVORY_ADDED, 'yes-pre-1975')
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }

    if (payload.yesNoIdk === 'I dont know') {
      return 'Best find out then!'
    }

    if (payload.yesNoIdk === 'Yes') {
      return 'Those poor elephants, you are not selling that!'
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
  if (Validators.empty(payload.yesNoIdk)) {
    errors.push({
      name: 'yesNoIdk',
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
