'use strict'

const { ItemType, Paths, RedisKeys, Views, Options } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.RMI_AND_PRE_1918, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
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
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.HIGH_VALUE
        )
        return h.redirect(Paths.IVORY_ADDED)
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is it a pre-1918 item of outstandingly high artistic, cultural or historical value?',
    helpText: 'The item must:',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.rmiAndPre1918)) {
    errors.push({
      name: 'rmiAndPre1918',
      text: 'Tell us whether your item is a pre-1918 item of outstandingly high artistic, cultural or historical value'
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
