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

  static async deleteSessionData (request) {
    const client = request.redis.client
    const sessionKey = request.state[DEFRA_IVORY_SESSION_KEY]
    const totalPossibleKeys =
      Object.keys(RedisKeys).length +
      UploadPhoto.MAX_PHOTOS +
      UploadDocument.MAX_DOCUMENTS

    const keys = []

    let scanResult = await client.scan('0', 'MATCH', `${sessionKey}.*`)
    let cursor = scanResult[0]

    keys.push(...scanResult[1])

    while (cursor !== '0') {
      scanResult = await client.scan(cursor, 'MATCH', `${sessionKey}.*`)
      cursor = scanResult[0]
      keys.push(...scanResult[1])
    }

    if (keys.length > totalPossibleKeys) {
      // Mitigates against a malicious attack using this wildcard search to remove all Redis keys
      console.error(
        `Request to clear ${keys.length} Redis keys failed as exceeded the max allowed of ${totalPossibleKeys}`
      )
    } else {
      for (const key of keys) {
        client.del(key)
      }
    }
  }
}

const _isJsonString = value =>
  value && value.length && value.startsWith('{') && value.endsWith('}')
