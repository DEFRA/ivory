'use strict'

const RedisService = require('../../server/services/redis.service')

let mockRequest
const sessionId = 'the-session-id'
const redisKey = 'some_key'

describe('Redis service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('get method', () => {
    it('should get a value from Redis', async () => {
      _createMocks(mockRedisValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(mockRedisValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should return null if the key is not found in Redis', async () => {
      _createMocks(null)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(null)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })
  })

  describe('set method', () => {
    beforeEach(() => {
      _createMocks(mockRedisValue)
    })

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

  describe('delete method', () => {
    beforeEach(() => {
      _createMocks(mockRedisValue)
    })

    it('should delete a value from Redis', async () => {
      expect(mockRequest.redis.client.del).toBeCalledTimes(0)

      await RedisService.delete(mockRequest, redisKey)

      expect(mockRequest.redis.client.del).toBeCalledTimes(1)
      expect(mockRequest.redis.client.del).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })
  })

  describe('deleteSessionData method', () => {
    beforeEach(() => {
      _createMocks(mockRedisValue)
    })

    it('should not delete a value from Redis', async () => {
      expect(mockRequest.redis.client.keys).toBeCalledTimes(0)
      expect(mockRequest.redis.client.del).toBeCalledTimes(0)

      await RedisService.deleteSessionData(mockRequest)

      expect(mockRequest.redis.client.keys).toBeCalledTimes(1)
      expect(mockRequest.redis.client.del).toBeCalledTimes(0)
    })
  })
})

const mockRedisValue = 'MOCK REDIS VALUE'

const _createMocks = mockValue => {
  mockRequest = jest.fn()
  mockRequest.state = {
    DefraIvorySession: sessionId
  }
  mockRequest.redis = {
    client: {
      del: jest.fn(),
      get: jest.fn(() => mockValue),
      setex: jest.fn(),
      keys: jest.fn()
    }
  }
}
