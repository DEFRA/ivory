'use strict'

const { Paths, RedisKeys, Views } = require('../utils/constants')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

const SUCCESS = 'success'

const handlers = {
  get: async (request, h) => {
    const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)

    const payment = await PaymentService.lookupPayment(paymentId)

    const paymentSucceeded = payment.state.status === SUCCESS

    return h.view(Views.SERVICE_COMPLETE, {
      ..._getContext(paymentSucceeded)
    })
  }
}

const _getContext = paymentSucceeded => {
  return {
    pageTitle: 'Service complete',
    paymentSucceeded
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
