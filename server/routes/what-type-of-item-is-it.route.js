'use strict'

const { Paths, RedisKeys, Views } = require('../utils/constants')
const config = require('../utils/config')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.WHAT_TYPE_OF_ITEM_IS_IT, {
      ..._getContext()
    })
  },

  post: (request, h) => {
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

    RedisService.set(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
      payload.whatTypeOfItemIsIt
    )

    const cost =
      payload.whatTypeOfItemIsIt !==
      'Item made before 1918 that has outstandingly high artistic, cultural or historical value'
        ? config.paymentAmountBandA
        : config.paymentAmountBandB

    RedisService.set(request, RedisKeys.PAYMENT_AMOUNT, cost)

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}
const _getContext = () => {
  return {
    pageTitle: 'What is your ivory item?'
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
