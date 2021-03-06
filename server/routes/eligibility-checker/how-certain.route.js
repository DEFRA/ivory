'use strict'

const RedisService = require('../../services/redis.service')
const { Paths, Views, RedisKeys } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const completelyCertain = 'Completely'

const handlers = {
  get: (request, h) => {
    return h.view(Views.HOW_CERTAIN)
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.HOW_CERTAIN, {
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.USED_CHECKER,
      payload.howCertain !== completelyCertain
    )

    return h.redirect(
      payload.howCertain === completelyCertain
        ? Paths.WHAT_TYPE_OF_ITEM_IS_IT
        : Paths.CONTAIN_ELEPHANT_IVORY
    )
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.howCertain)) {
    errors.push({
      name: 'howCertain',
      text:
        'Tell us how certain you are that your item is exempt from the ivory ban'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.post
  }
]
