'use strict'

const RedisService = require('./redis.service')

const { ItemType, Options, RedisKeys } = require('../utils/constants')

module.exports = class RedisHelper {
  static async getItemType (request) {
    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )
    return itemType
  }

  static async isSection2 (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType === ItemType.HIGH_VALUE
  }

  static async isSection10 (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType !== ItemType.HIGH_VALUE
  }

  static async isMuseum (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType === ItemType.MUSEUM
  }

  static async isOwnedByApplicant (request) {
    const isOwnedByApplicant =
      (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
      Options.YES

    return isOwnedByApplicant
  }

  static async hasUsedChecker (request) {
    return (await RedisService.get(request, RedisKeys.USED_CHECKER)) === 'true'
  }

  static async hasAppliedBefore (request) {
    const appliedBefore = await RedisService.get(
      request,
      RedisKeys.APPLIED_BEFORE
    )

    return appliedBefore === Options.YES
  }

  static async isAlreadyCertified (request, alreadyCertified = null) {
    if (!alreadyCertified) {
      alreadyCertified = await RedisService.get(
        request,
        RedisKeys.ALREADY_CERTIFIED
      )
    }
    return alreadyCertified && alreadyCertified.alreadyCertified === Options.YES
  }

  static async isRevoked (request, revokedCertificateNumber = null) {
    if (!revokedCertificateNumber) {
      revokedCertificateNumber = await RedisService.get(
        request,
        RedisKeys.REVOKED_CERTIFICATE
      )
    }

    return revokedCertificateNumber !== null
  }
}
