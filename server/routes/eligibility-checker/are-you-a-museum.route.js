'use strict'

const { ItemType, Paths, RedisKeys, Views } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.ARE_YOU_A_MUSEUM, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ARE_YOU_A_MUSEUM, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.areYouAMuseum) {
      case 'Yes':
        return h.redirect(Paths.DO_NOT_NEED_SERVICE)
      case 'No':
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.MUSEUM
        )
        return h.redirect(Paths.CAN_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Are you selling or hiring the item out on behalf of a museum?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.areYouAMuseum)) {
    errors.push({
      name: 'areYouAMuseum',
      text: 'You need to select something!'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.ARE_YOU_A_MUSEUM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.ARE_YOU_A_MUSEUM}`,
    handler: handlers.post
  }
]
