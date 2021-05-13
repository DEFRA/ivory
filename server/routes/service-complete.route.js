'use strict'

const { Paths, RedisKeys, Views } = require('../utils/constants')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

const PaymentResult = {
  SUCCESS: 'success',
  FAILED: 'failed',
  Codes: {
    CANCELLED: 'P0030'
  }
}

const handlers = {
  get: async (request, h) => {
    const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)

    const payment = await PaymentService.lookupPayment(paymentId)

    if (_paymentCancelled(payment.state)) {
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }

    if (_paymentFailed(payment.state)) {
      return h.redirect(Paths.MAKE_PAYMENT)
    }

    return h.view(Views.SERVICE_COMPLETE, {
      ...(await _getContext(request))
    })
  }
}

const _getContext = async request => {
  const paymentReference = await RedisService.get(
    request,
    RedisKeys.PAYMENT_REFERENCE
  )

  return {
    pageTitle: 'Service complete',
    paymentReference,
    hideBackLink: true
  }
}

const _paymentCancelled = state => {
  return (
    state &&
    state.status &&
    state.status === PaymentResult.FAILED &&
    state.code === PaymentResult.Codes.CANCELLED
  )
}

const _paymentFailed = state => {
  return state && state.status && state.status === PaymentResult.FAILED
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
