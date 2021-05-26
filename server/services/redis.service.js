'use strict'

const { SESSION_ID } = require('../utils/constants')
const REDIS_TTL_IN_SECONDS = 86400

module.exports = class RedisService {
  static async get (request, key) {
    const client = request.redis.client
    return client.get(`${request.state[SESSION_ID]}.${key}`)
  }

  static async set (request, key, value) {
    const client = request.redis.client
    const keyWithSessionId = `${request.state[SESSION_ID]}.${key}`
    client.setex(keyWithSessionId, REDIS_TTL_IN_SECONDS, value)

    // TODO Confirm expiry still works
    // client.expire(keyWithSessionId, REDIS_TTL_IN_SECONDS)
  }
}
