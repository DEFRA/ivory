'use strict'

const { v4: uuidv4 } = require('uuid')
const CookieService = require('../services/cookie.service')
const RedisService = require('../services/redis.service')

const {
  HOME_URL,
  DEFRA_IVORY_SESSION_KEY,
  Paths
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const hasSessionKey = CookieService.checkForSessionKey(request)

    if (hasSessionKey) {
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
