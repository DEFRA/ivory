'use strict'

const { DEFRA_IVORY_SESSION_KEY } = require('../utils/constants')

module.exports = class CookieService {
  static getSessionCookie (request, displayLogMessage = true) {
    const sessionCookie = request.state[DEFRA_IVORY_SESSION_KEY]
    if (!sessionCookie && displayLogMessage) {
      console.log(`Session cookie not found for page ${request.url.pathname}`)
    }
    return sessionCookie
  }
}
