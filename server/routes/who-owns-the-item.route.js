'use strict'

const { Options, Paths, Views, RedisKeys } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.WHO_OWNS_ITEM)
  },

  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.WHO_OWNS_ITEM, {
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    RedisService.set(
      request,
      RedisKeys.OWNED_BY_APPLICANT,
      payload.whoOwnsItem === 'I own it' ? Options.YES : Options.NO
    )

    return h.redirect(Paths.OWNER_CONTACT_DETAILS)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.whoOwnsItem)) {
    errors.push({
      name: 'whoOwnsItem',
      text: 'Tell us who owns the item'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHO_OWNS_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHO_OWNS_ITEM}`,
    handler: handlers.post
  }
]
