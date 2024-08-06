'use strict'

const { v4: uuidv4 } = require('uuid')
const CookieService = require('../services/cookie.service')
const RedisService = require('../services/redis.service')

const {
  DEFRA_IVORY_SESSION_KEY,
  Paths,
  HOME_URL
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const useChecker = request.query.useChecker

    const sessionCookie = CookieService.getSessionCookie(request, false)

    if (sessionCookie) {
      RedisService.deleteSessionData(request)
    }
    _setCookieSessionId(h)

    return useChecker
      ? h.redirect(Paths.CONTAIN_ELEPHANT_IVORY)
      : h.redirect(Paths.HOW_CERTAIN)
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
