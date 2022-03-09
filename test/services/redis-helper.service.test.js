'use strict'

jest.mock('../../server/services/redis.service')
const RedisService = require('../../server/services/redis.service')
const RedisHelper = require('../../server/services/redis-helper.service')

const { ItemType, Options } = require('../../server/utils/constants')

describe('RedisHelper service', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getItemType method', () => {
    it('should get a the item type from Redis', async () => {
      const itemType = ItemType.MUSEUM

      RedisService.get = jest.fn().mockResolvedValue(itemType)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.getItemType()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toEqual(itemType)
    })
  })

  describe('isSection10 method', () => {
    it('should return true if the item is: MUSEUM)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSEUM)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection10()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return true if the item is: TEN_PERCENT)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.TEN_PERCENT)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection10()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return true if the item is: MUSICAL)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSICAL)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection10()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return true if the item is: MINIATURE)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MINIATURE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection10()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the item is: HIGH_VALUE)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection10()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })

  describe('isSection2 method', () => {
    it('should return false if the item is: MUSEUM)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSEUM)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection2()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })

    it('should return false if the item is: TEN_PERCENT)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.TEN_PERCENT)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection2()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })

    it('should return false if the item is: MUSICAL)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSICAL)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection2()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })

    it('should return true if the item is: MINIATURE)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MINIATURE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection2()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })

    it('should return false if the item is: HIGH_VALUE)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isSection2()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })
  })

  describe('isMuseum method', () => {
    it('should return true if the item is: MUSEUM)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MUSEUM)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isMuseum()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the item is NOT: MUSEUM)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isMuseum()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })

  describe('isPortraitMiniature method', () => {
    it('should return true if the item is: PORTRAIT MINIATURE)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.MINIATURE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isPortraitMiniature()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the item is NOT: PORTRAIT MINIATURE)', async () => {
      RedisService.get = jest.fn().mockResolvedValue(ItemType.HIGH_VALUE)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isPortraitMiniature()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })

  describe('isOwnedByApplicant method', () => {
    it('should return true if the item is owned by the applicant', async () => {
      RedisService.get = jest.fn().mockResolvedValue(Options.YES)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isOwnedByApplicant()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the item is NOT owned by the applicant', async () => {
      RedisService.get = jest.fn().mockResolvedValue(Options.NO)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isOwnedByApplicant()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })

  describe('hasUsedChecker method', () => {
    it('should return true if the user has used the eligibility checker', async () => {
      RedisService.get = jest.fn().mockResolvedValue('true')

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.hasUsedChecker()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the user has NOT used the eligibility checker', async () => {
      RedisService.get = jest.fn().mockResolvedValue(false)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.hasUsedChecker()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })

  describe('isAlreadyCertified method', () => {
    it('should return true if the item is already certified', async () => {
      RedisService.get = jest
        .fn()
        .mockResolvedValue({ alreadyCertified: Options.YES })

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isAlreadyCertified()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the item is NOT already certified', async () => {
      RedisService.get = jest
        .fn()
        .mockResolvedValue({ alreadyCertified: Options.NO })

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isAlreadyCertified()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })

  describe('isRevoked method', () => {
    it('should return true if the item is already certified', async () => {
      RedisService.get = jest.fn().mockResolvedValue('__REVOKED_')

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isRevoked()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeTruthy()
    })

    it('should return false if the item is NOT already certified', async () => {
      RedisService.get = jest.fn().mockResolvedValue(null)

      expect(RedisService.get).toBeCalledTimes(0)
      const value = await RedisHelper.isRevoked()

      expect(RedisService.get).toBeCalledTimes(1)
      expect(value).toBeFalsy()
    })
  })
})
