'use strict'

const RedisService = require('../../../services/redis.service')
const { Paths, RedisKeys, Views } = require('../../../utils/constants')
const { buildErrorSummary, Validators } = require('../../../utils/validation')
const { addPayloadToContext } = require('../../../utils/general')

const completedBy = 'owner' // Temporary until previous page built then will use value saved in Redis. Use 'owner' or '3rdParty'

const handlers = {
  get: (request, h) => {
    return h.view(Views.ADDRESS_INTERNATIONAL, {
      ..._getContext()
    })
  },
  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_INTERNATIONAL, {
          ..._getContext(request),
          ...buildErrorSummary(errors)
        })
        .code(400)
    } else {
      RedisService.set(
        request,
        RedisKeys.OWNER_INTERNATIONAL_ADDRESS,
        payload.internationalAddress
      )
      return h.redirect(`${Paths.CHECK_YOUR_ANSWERS}`)
    }
  }
}

const _getContext = request => {
  let context

  if (completedBy === 'owner') {
    context = {
      title: 'Enter your address',
      hintText: 'If your business owns the item, give your business address.'
    }
  } else {
    context = {
      title: 'Enter the owner’s address',
      hintText: 'If the owner is a business, give the business address.'
    }
  }

  addPayloadToContext(request, context)

  return context
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.internationalAddress)) {
    errors.push({
      name: 'internationalAddress',
      text: 'Enter the address'
    })
  }

  const characterLimit = 4000
  if (Validators.maxLength(payload.internationalAddress, characterLimit)) {
    errors.push({
      name: 'internationalAddress',
      text: `Enter a shorter address with no more than ${characterLimit} characters`
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_INTERNATIONAL}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_INTERNATIONAL}`,
    handler: handlers.post
  }
]
