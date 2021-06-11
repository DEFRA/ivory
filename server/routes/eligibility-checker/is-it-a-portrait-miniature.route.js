'use strict'

const { ItemType, Paths, RedisKeys, Views, Options } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IS_IT_A_PORTRAIT_MINIATURE, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IS_IT_A_PORTRAIT_MINIATURE, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.isItAPortraitMiniature) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.MINIATURE
        )
        return h.redirect(Paths.IS_ITEM_PRE_1918)
      case Options.NO:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ''
        )
        return h.redirect(Paths.IS_ITEM_PRE_1918)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Is it a portrait miniature?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItAPortraitMiniature)) {
    errors.push({
      name: 'isItAPortraitMiniature',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_IT_A_PORTRAIT_MINIATURE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_IT_A_PORTRAIT_MINIATURE}`,
    handler: handlers.post
  }
]
