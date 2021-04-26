'use strict'

const { Paths, Views, RedisKeys } = require('../../../utils/constants')
const RedisService = require('../../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../../utils/validation')

// const completedBy = 'owner' // Temporary until previous page built then will use value saved in Redis. Use 'owner' or '3rdParty'

const handlers = {
  get: async (request, h) => {
    return h.view(Views.ADDRESS_CHOOSE, {
      ...(await _getContext(request))
    })
  },
  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_CHOOSE, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.view(Views.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = async request => {
  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND)
  )

  const items = addresses.map(item => {
    return {
      value: item.Address.AddressLine,
      text: item.Address.AddressLine
    }
  })

  return {
    title: 'Choose your address',
    addresses: items
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.address)) {
    errors.push({
      name: 'address',
      text: 'You must choose an address'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: handlers.post
  }
]
