'use strict'

const { v4: uuidv4 } = require('uuid')
const RandomString = require('randomstring')

const RedisService = require('../services/redis.service')

const {
  HOME_URL,
  DEFRA_IVORY_SESSION_KEY,
  Paths,
  RedisKeys
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    _setCookieSessionId(h)

    const submissionReference = _generateSubmissionReference()

    await RedisService.set(
      request,
      RedisKeys.SUBMISSION_REFERENCE,
      submissionReference
    )

    return h.redirect(Paths.HOW_CERTAIN)
  }
}

const _setCookieSessionId = h => {
  h.state(DEFRA_IVORY_SESSION_KEY, uuidv4())
}

/**
 * Generates a random 8 character uppercase alphanumeric reference
 * @returns Reference
 */
const _generateSubmissionReference = () => {
  return RandomString.generate({
    length: 8,
    readable: true,
    charset: 'alphanumeric',
    capitalization: 'uppercase'
  })
}

module.exports = [
  {
    method: 'GET',
    path: HOME_URL,
    handler: handlers.get
  }
]
