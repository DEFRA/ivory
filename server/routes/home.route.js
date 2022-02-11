'use strict'

const { v4: uuidv4 } = require('uuid')
const RedisService = require('../services/redis.service')

const {
  HOME_URL,
  DEFRA_IVORY_SESSION_KEY,
  Paths
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const sessionKey = request.state[DEFRA_IVORY_SESSION_KEY]
    if (sessionKey) {
      RedisService.deleteSessionData(request)
    }
    _setCookieSessionId(h)

    return h.redirect(Paths.HOW_CERTAIN)
  }
}

const _setCookieSessionId = h => {
  h.state(DEFRA_IVORY_SESSION_KEY, uuidv4())
}

module.exports = [
  {
    method: 'GET',
    path: HOME_URL,
    handler: handlers.get
  }
]
