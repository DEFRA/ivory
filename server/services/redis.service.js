'use strict'

const REDIS_TTL_IN_SECONDS = 86400
const {
  DEFRA_IVORY_SESSION_KEY,
  RedisKeys,
  UploadPhoto,
  UploadDocument
} = require('../utils/constants')

module.exports = class RedisService {
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

  static deleteSessionData (request) {
    const client = request.redis.client
    const sessionKey = request.state[DEFRA_IVORY_SESSION_KEY]
    const totalPossibleKeys = Object.keys(RedisKeys).length + UploadPhoto.MAX_PHOTOS + UploadDocument.MAX_DOCUMENTS
    client.keys(`${sessionKey}*`, function (err, keys) {
      if (err) {
        console.error(err)
      } else if (keys.length > totalPossibleKeys) { // Mitigates against a malicious attack using this wildcard search to remove all Redis keys
        console.error(`Request to clear ${keys.length} Redis keys failed as exceeded the max allowed of ${totalPossibleKeys}`)
      } else {
        for (let i = 0; i < keys.length; i++) {
          client.del(keys[i])
        }
      }
    })
  }
}
