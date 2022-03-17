'use strict'

const { HOME_URL, Paths } = require('../utils/constants')

const handlers = {
  get: async (_request, h) => {
    return h.redirect(`${HOME_URL}?useChecker=true`)
  }
}

module.exports = [
  {
    method: 'GET',
    path: Paths.USE_CHECKER,
    handler: handlers.get
  }
]
