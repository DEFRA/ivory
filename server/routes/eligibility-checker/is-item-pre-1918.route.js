'use strict'

const { ItemType, Paths, RedisKeys, Views, Options } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IS_ITEM_PRE_1918, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)
    const whatIsItem = await RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)

    if (errors.length) {
      return h
        .view(Views.IS_ITEM_PRE_1918, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.isItemPre1918) {
      case Options.YES:
        if (whatIsItem === ItemType.MINIATURE) {
          return h.redirect(Paths.LESS_THAN_320CM_SQUARED)
        } else {
          return h.redirect(Paths.IS_IT_RMI)
        }
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was your item made before 1 January 1918?',
    helpText: 'The following might help you decide:',
    items: [
      {
        value: Options.YES,
        text: Options.YES
      },
      {
        value: Options.NO,
        text: Options.NO
      },
      {
        value: Options.I_DONT_KNOW,
        text: Options.I_DONT_KNOW
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItemPre1918)) {
    errors.push({
      name: 'isItemPre1918',
      text: 'Tell us whether your item was made before 1918'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_ITEM_PRE_1918}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_ITEM_PRE_1918}`,
    handler: handlers.post
  }
]
