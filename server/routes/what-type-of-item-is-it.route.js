'use strict'

const config = require('../utils/config')
const { ItemType, Paths, RedisKeys, Views } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.WHAT_TYPE_OF_ITEM_IS_IT, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.WHAT_TYPE_OF_ITEM_IS_IT, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
      payload.whatTypeOfItemIsIt
    )

    const cost =
      payload.whatTypeOfItemIsIt !== ItemType.HIGH_VALUE
        ? config.paymentAmountBandA
        : config.paymentAmountBandB

    await RedisService.set(request, RedisKeys.PAYMENT_AMOUNT, cost)

    return h.redirect(Paths.DESCRIBE_THE_ITEM)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'What is your ivory item?',
    items: [
      {
        value: ItemType.MUSICAL,
        text: ItemType.MUSICAL,
        hint: {
          text:
            'Any replacement ivory must have been harvested before 1 January 1975.'
        }
      },
      {
        value: ItemType.TEN_PERCENT,
        text: ItemType.TEN_PERCENT,
        hint: {
          text:
            'The ivory must be integral to the item. Any replacement ivory must have been harvested before 1 January 1975.'
        }
      },
      {
        value: ItemType.MINIATURE,
        text: ItemType.MINIATURE,
        hint: {
          text:
            'Any replacement ivory must have been harvested before 1 January 1975.'
        }
      },
      {
        value: ItemType.MUSEUM,
        text: ItemType.MUSEUM,
        hint: {
          text:
            'This cannot be raw (‘unworked’) ivory. You don’t need to tell us if you are a qualifying museum that’s selling or hiring out an ivory item to another qualifying museum.'
        }
      },
      {
        value: ItemType.HIGH_VALUE,
        text: ItemType.HIGH_VALUE,
        hint: {
          text:
            'Any replacement ivory must have been harvested before 1 January 1975.'
        }
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whatTypeOfItemIsIt)) {
    errors.push({
      name: 'whatTypeOfItemIsIt',
      text: 'Tell us what type of ivory you want to sell or hire out'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHAT_TYPE_OF_ITEM_IS_IT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHAT_TYPE_OF_ITEM_IS_IT}`,
    handler: handlers.post
  }
]
