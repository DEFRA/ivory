'use strict'

const RedisService = require('../../services/redis.service')
const { Options, Paths, RedisKeys, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CONTAIN_ELEPHANT_IVORY, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CONTAIN_ELEPHANT_IVORY, {
          ...(await _getContext()),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.containElephantIvory) {
      case Options.YES:
        return h.redirect(Paths.SELLING_TO_MUSEUM)
      case Options.NO:
        await RedisService.set(request, RedisKeys.CONTAIN_ELEPHANT_IVORY, false)

        return h.redirect(Paths.DO_NOT_NEED_SERVICE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Does your item contain elephant ivory?',
    helpText:
      'Any ivory in your item must be ‘worked’ ivory. This means it has been carved or significantly altered from its original raw state in some way.',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.containElephantIvory)) {
    errors.push({
      name: 'containElephantIvory',
      text: 'Tell us whether your item contains elephant ivory'
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
