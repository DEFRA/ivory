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

    it('should get a bolean true value from Redis', async () => {
      const mockValue = 'true'
      _createMocks(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(true)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should get a bolean false value from Redis', async () => {
      const mockValue = 'false'
      _createMocks(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)
      expect(redisValue).toEqual(false)

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

      expect(redisValue).toEqual(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(1)
      expect(mockRequest.redis.client.get).toBeCalledWith(
        `${sessionId}.${redisKey}`
      )
    })

    it('should get a string from Redis when it looks like a JSON object but it cannot be parsed', async () => {
      const mockValue = '{invalid-json-object}'

      _createMocks(mockValue)

      expect(mockRequest.redis.client.get).toBeCalledTimes(0)

      const redisValue = await RedisService.get(mockRequest, redisKey)

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
      const redisTtlSeconds = 7200

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

    it('should delete values from Redis', async () => {
      expect(mockRequest.redis.client.scan).toBeCalledTimes(0)
      expect(mockRequest.redis.client.del).toBeCalledTimes(0)

      await RedisService.deleteSessionData(mockRequest)

      expect(mockRequest.redis.client.scan).toBeCalledTimes(2)
      expect(mockRequest.redis.client.del).toBeCalledTimes(6)
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
      scan: jest
        .fn()
        .mockReturnValueOnce([
          '33',
          ['redis_key_1', 'redis_key_2', 'redis_key_3']
        ])
        .mockReturnValueOnce([
          '0',
          ['redis_key_4', 'redis_key_5', 'redis_key_n']
        ])
    }
  }
}
