'use strict'

const { v4: uuidv4 } = require('uuid')
const { DEFRA_IVORY_SESSION_KEY, Paths } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
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
    path: '/',
    handler: handlers.get
  }
]
