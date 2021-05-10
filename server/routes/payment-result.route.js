'use strict'

const { Paths, Views, RedisKeys } = require('../utils/constants')
// const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

const handlers = {
  get: async (request, h) => {
    const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)
    console.log(paymentId)
    return h.view(Views.SERVICE_COMPLETE, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    console.log('POST:', payload)

    return h.view(Views.SERVICE_COMPLETE, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Payment result'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PAYMENT_RESULT}`,
    handler: handlers.get
  }
]
