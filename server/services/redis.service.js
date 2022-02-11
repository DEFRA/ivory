'use strict'

const { DEFRA_IVORY_SESSION_KEY } = require('../utils/constants')
const REDIS_TTL_IN_SECONDS = 86400

module.exports = class RedisService {
  static async get (request, key) {
    const client = request.redis.client
    const redisValue = await client.get(
      `${request.state[DEFRA_IVORY_SESSION_KEY]}.${key}`
    )

    let parsedValue = redisValue
    if (_isJsonString(redisValue)) {
      try {
        parsedValue = JSON.parse(redisValue)
      } catch (e) {
        parsedValue = redisValue
      }
    }

    return parsedValue
  }

  static set (request, key, value) {
    const client = request.redis.client
    const keyWithSessionId = `${request.state[DEFRA_IVORY_SESSION_KEY]}.${key}`
    return client.setex(keyWithSessionId, REDIS_TTL_IN_SECONDS, value)
  }

  static delete (request, key) {
    const client = request.redis.client
    const keyWithSessionId = `${request.state[DEFRA_IVORY_SESSION_KEY]}.${key}`
    client.del(keyWithSessionId)
  }
}

const _isJsonString = value =>
  value && value.length && value.startsWith('{') && value.endsWith('}')
