'use strict'

const RedisService = require('./redis.service')

const {
  ItemType,
  Options,
  RedisKeys,
  AlreadyCertifiedOptions
} = require('../utils/constants')

module.exports = class RedisHelper {
  static async getItemType (request) {
    return RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
  }

  /**
   * Returns a boolean to indicate whether or not the application is for an RMI (Rare, Most Important)
   * exemption type, otherwise known as a "Section 2".
   * @param {*} request The HTTP request object
   * @param {*} itemType Optional item type - if not provided then the value is looked up in the Redis cache instead.
   * @returns True if the application is a Section 2, otherwise false (i.e. Section 10)
   */
  static async isSection2 (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType === ItemType.HIGH_VALUE
  }

  /**
   * Returns a boolean to indicate whether or not the application is for a non-RMI (Rare, Most Important)
   * exemption type, otherwise known as a "Section 10".
   * @param {*} request The HTTP request object.
   * @param {*} itemType Optional item type - if not provided then the value is looked up in the Redis cache instead.
   * @returns True if the application is a Section 10, otherwise false (i.e. Section 2).
   */
  static async isSection10 (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType !== ItemType.HIGH_VALUE
  }

  /**
   * Returns a boolean to indicate whether or not the application is for a museum exemption type.
   * @param {*} request The HTTP request object.
   * @param {*} itemType Optional item type - if not provided then the value is looked up in the Redis cache instead.
   * @returns True if the application is a museum exemption type, otherwise false.
   */
  static async isMuseum (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType === ItemType.MUSEUM
  }

  /**
   * Returns a boolean to indicate whether or not the application is for a portrait miniature exemption type.
   * @param {*} request The HTTP request object.
   * @param {*} itemType Optional item type - if not provided then the value is looked up in the Redis cache instead.
   * @returns True if the application is a portrait miniature exemption type, otherwise false.
   */
  static async isPortraitMiniature (request, itemType = null) {
    if (!itemType) {
      itemType = await RedisService.get(
        request,
        RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
      )
    }
    return itemType === ItemType.MINIATURE
  }

  /**
   * Returns a boolean to indicate whether or not the item is owned by the applicant (i.e. this is NOT a 3rd party application).
   * @param {*} request The HTTP request object.
   * @returns True if the item is owned by the applicant, otherwise false.
   */
  static async isOwnedByApplicant (request) {
    return (
      (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
      Options.YES
    )
  }

  /**
   * Returns a boolean to indicate whether or not the eligibility checker has been used
   * during the completion of the application.
   * @param {*} request The HTTP request object.
   * @returns True if the eligibility checker has been used, otherwise false.
   */
  static async hasUsedChecker (request) {
    return RedisService.get(request, RedisKeys.USED_CHECKER)
  }

  /**
   * Returns a boolean to indicate whether or not the item has been the subject of a previous application.
   * @param {*} request The HTTP request object.
   * @returns True if the item has been the subject of a previous application, otherwise false.
   */
  static async hasAppliedBefore (request) {
    const appliedBefore = await RedisService.get(
      request,
      RedisKeys.APPLIED_BEFORE
    )

    return appliedBefore === Options.YES
  }

  /**
   * Returns a boolean to indicate whether or not the item is already certified.
   * @param {*} request The HTTP request object.
   * @returns True if the item is already certified, otherwise false.
   */
  static async isAlreadyCertified (request, alreadyCertified = null) {
    if (!alreadyCertified) {
      alreadyCertified = await RedisService.get(
        request,
        RedisKeys.ALREADY_CERTIFIED
      )
    }
    return (
      alreadyCertified &&
      alreadyCertified.alreadyCertified === AlreadyCertifiedOptions.YES
    )
  }

  /**
   * Returns a boolean to indicate whether or not the item was previously certified but the
   * certification has been revoked.
   * @param {*} request The HTTP request object.
   * @returns True if the certification has been revoked, otherwise false.
   */
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
