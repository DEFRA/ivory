'use strict'

import { DEFRA_IVORY_SESSION_KEY } from '../utils/constants.js';
const REDIS_TTL_IN_SECONDS = 86400

export class RedisService {
  static async get (request, key) {
    const client = request.redis.client
    const redisValue = await client.get(
      `${request.state[DEFRA_IVORY_SESSION_KEY]}.${key}`
    )

    let parsedValue
    if (redisValue !== null) {
      try {
        parsedValue = JSON.parse(redisValue)
      } catch (e) {
        parsedValue = redisValue
      }
    } else {
      parsedValue = null
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
};

export default RedisService;
