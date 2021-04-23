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

      expect(mockRequest.redis.client.set).toBeCalledTimes(0)
      expect(mockRequest.redis.client.expire).toBeCalledTimes(0)

      await RedisService.set(mockRequest, redisKey, redisValue)

      expect(mockRequest.redis.client.set).toBeCalledTimes(1)
      expect(mockRequest.redis.client.set).toBeCalledWith(
        `${sessionId}.${redisKey}`,
        redisValue
      )

      expect(mockRequest.redis.client.expire).toBeCalledTimes(1)
      expect(mockRequest.redis.client.expire).toBeCalledWith(
        `${sessionId}.${redisKey}`,
        redisTtlSeconds
      )
    })
  })
})

const _createMocks = () => {
  mockRequest = jest.fn()
  mockRequest.state = {
    sessionId
  }
  mockRequest.redis = {
    client: {
      get: jest.fn(),
      set: jest.fn(),
      expire: jest.fn()
    }
  }
}
