'use strict'

const { ItemType, Paths, RedisKeys, Views } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IS_IT_A_MUSICAL_INSTRUMENT, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
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
      case 'Yes':
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.MUSICAL
        )
        return h.redirect(Paths.MADE_BEFORE_1975)
      case 'No':
        return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is your item a musical instrument?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItAMusicalInstrument)) {
    errors.push({
      name: 'isItAMusicalInstrument',
      text: 'You need to select something!'
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
