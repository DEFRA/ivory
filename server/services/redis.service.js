'use strict'

const { DEFRA_IVORY_SESSION_KEY } = require('../utils/constants')
const REDIS_TTL_IN_SECONDS = 86400

module.exports = class RedisService {
  static async get (request, key) {
    const client = request.redis.client
    return client.get(`${request.state[DEFRA_IVORY_SESSION_KEY]}.${key}`)
  }

  static async set (request, key, value) {
    const client = request.redis.client
    const keyWithSessionId = `${request.state[DEFRA_IVORY_SESSION_KEY]}.${key}`
    client.setex(keyWithSessionId, REDIS_TTL_IN_SECONDS, value)
  }
}
