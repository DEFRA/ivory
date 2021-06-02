'use strict'

const RedisService = require('../../server/services/redis.service')

let mockRequest
const sessionId = 'the-session-id'
const redisKey = 'some_key'

describe('Redis service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('get method', () => {
    it('should get a value from Redis', async () => {
      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      await RedisService.get(mockRequest, redisKey)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })
  })

  describe('set method', () => {
    it('should set a value in Redis with correct expiry (TTL)', async () => {
      const redisValue = 'some_value'
      const redisTtlSeconds = 86400

      expect(mockRequest.redis.client.setex).toBeCalledTimes(0)

      await RedisService.set(mockRequest, redisKey, redisValue)

      expect(mockRequest.redis.client.setex).toBeCalledTimes(1)
      expect(mockRequest.redis.client.setex).toBeCalledWith(
        `${sessionId}.${redisKey}`,
        redisTtlSeconds,
        redisValue
      )
    })
  })
})

const _createMocks = () => {
  mockRequest = jest.fn()
  mockRequest.state = {
    DefraIvorySession: sessionId
  }
  mockRequest.redis = {
    client: {
      get: jest.fn(),
      setex: jest.fn()
    }
  }
}
