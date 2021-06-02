'use strict'

const { v4: uuidv4 } = require('uuid')
const { DEFRA_IVORY_SESSION_KEY, Views } = require('../utils/constants')

const handlers = {
  get: (request, h) => {
    _setCookieSessionId(h)

    return h.view(Views.HOME, {
      pageTitle: 'Hello',
      message: 'Elephants'
    })
  },

  post: (request, h) => {
    return h.view(Views.HOME, {
      pageTitle: 'Hello',
      message: 'Elephants'
    })
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
  },
  {
    method: 'POST',
    path: '/',
    handler: handlers.post
  }
]
