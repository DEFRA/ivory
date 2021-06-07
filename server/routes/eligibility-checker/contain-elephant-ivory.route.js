'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CONTAIN_ELEPHANT_IVORY, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CONTAIN_ELEPHANT_IVORY, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (itemType) {
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
    pageTitle: 'Does your item contain elephant ivory?'
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
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.post
  }
]
