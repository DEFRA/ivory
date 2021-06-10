'use strict'

const { ItemType, Paths, RedisKeys, Views } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.MADE_BEFORE_1947, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.MADE_BEFORE_1947, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.madeBefore1947) {
      case 'Yes':
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.TEN_PERCENT
        )
        return h.redirect(Paths.IVORY_ADDED)
      case 'No':
        return h.redirect(Paths.CANNOT_TRADE)
      case 'I dont know':
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was the item made before 3 March 1947?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.madeBefore1947)) {
    errors.push({
      name: 'madeBefore1947',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MADE_BEFORE_1947}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.MADE_BEFORE_1947}`,
    handler: handlers.post
  }
]
