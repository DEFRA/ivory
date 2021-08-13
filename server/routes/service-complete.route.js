'use strict'

const { Paths, RedisKeys, Views, PaymentResult } = require('../utils/constants')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

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

    if (_paymentError(payment.state)) {
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
    }

    return h.view(Views.SERVICE_COMPLETE, {
      ...(await _getContext(request))
    })
  }
}

const _getContext = async request => {
  const submissionReference = await RedisService.get(
    request,
    RedisKeys.SUBMISSION_REFERENCE
  )

  return {
    pageTitle: 'Service complete',
    submissionReference,
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

const _paymentError = state => {
  return state && state.status && state.status === PaymentResult.ERROR
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
