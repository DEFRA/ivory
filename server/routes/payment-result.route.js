'use strict'

const { Paths, Views, RedisKeys } = require('../utils/constants')
// const PaymentService = require('../services/payment.service')
// const RedisService = require('../services/redis.service')

// const server = require('../../server/index')

const handlers = {
  get: async (request, h) => {
    // const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)
    // const paymentId = await h.state.sessionId
    // console.log(paymentId)

    // const paymentId2 = await request.state.sessionId
    // console.log(paymentId2)

    // console.log(server.state)
    // return h.view(Views.SERVICE_COMPLETE, {
    //   ..._getContext()
    // })
    return h.redirect(Paths.SERVICE_COMPLETE)
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
