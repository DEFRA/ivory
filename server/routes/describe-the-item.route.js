'use strict'

const { Paths, RedisKeys, Views, ItemType } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary } = require('../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.DESCRIBE_THE_ITEM, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.DESCRIBE_THE_ITEM, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    console.log(itemType)

    // MUSICAL: 'Musical instrument made before 1975 with less than 20% ivory',
    // TEN_PERCENT: 'Item made before 3 March 1947 with less than 10% ivory',
    // MINIATURE: 'Portrait miniature made before 1918 with a surface area less than 320 square centimetres',
    // MUSEUM: 'Item to be sold or hired out to a qualifying museum',
    // HIGH_VALUE: 'Item made before 1918 that has outstandingly high artistic, cultural or historical value'

    switch (itemType) {
      // RMI?
      case ItemType.HIGH_VALUE:
        return h.redirect(Paths.WHY_IS_ITEM_RMI)
      case ItemType.MINIATURE:
        return h.redirect(Paths.IVORY_AGE)
      case ItemType.MUSEUM:
        return h.redirect(Paths.UPLOAD_PHOTOS)
      default:
        return h.redirect(Paths.IVORY_VOLUME)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Tell us about the item'
  }
}

const _validateForm = payload => {
  const errors = []

  // TODO Validation

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.DESCRIBE_THE_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.DESCRIBE_THE_ITEM}`,
    handler: handlers.post
  }
]
