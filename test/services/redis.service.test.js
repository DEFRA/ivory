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
    it('should get a string value from Redis', async () => {
      const mockValue = 'THIS IS A STRING VALUE'
      _createMocks(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should get a numeric value from Redis', async () => {
      const mockValue = 12345
      _createMocks(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should get a numeral-only string value from Redis', async () => {
      const mockValue = '12345'
      _createMocks(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should get a JSON-encoded object from Redis', async () => {
      const mockValue = {
        key1: 'VALUE 1',
        key2: 'VALUE 2'
      }

      _createMocks(JSON.stringify(mockValue))

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      console.log(redisValue)

      expect(redisValue).toEqual(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should get a JSON-encoded array object from Redis', async () => {
      const mockValue = [
        {
          key1: 'VALUE 1',
          key2: 'VALUE 2'
        },
        {
          key1: 'VALUE 3',
          key2: 'VALUE 4'
        }
      ]

      _createMocks(JSON.stringify(mockValue))

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)

      expect(redisValue).toEqual(mockValue)

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
      setex: jest.fn()
    }
  }
}
