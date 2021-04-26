'use strict'

const { Paths, RedisKeys, Views } = require('../../../utils/constants')
const RedisService = require('../../../services/redis.service')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.ADDRESS_CONFIRM, {
      ...(await _getContext(request))
    })
  },
  post: async (request, h) => {
    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = async request => {
  const addresses = JSON.parse(
    await RedisService.get(request, RedisKeys.ADDRESS_FIND)
  )

  return {
    title: 'Choose your address',
    address: addresses[0].Address
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CONFIRM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CONFIRM}`,
    handler: handlers.post
  }
]
