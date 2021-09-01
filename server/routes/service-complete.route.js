'use strict'

const { Paths, RedisKeys, Views, PaymentResult, ItemType } = require('../utils/constants')
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
  const itemType = await RedisService.get(
    request,
    RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
  )

  const isSection2 = itemType === ItemType.HIGH_VALUE

  const submissionReference = await RedisService.get(
    request,
    RedisKeys.SUBMISSION_REFERENCE
  )

  const applicantEmail = await RedisService.get(
    request,
    RedisKeys.APPLICANT_EMAIL_ADDRESS
  )

  const ownerEmail = await RedisService.get(
    request,
    RedisKeys.OWNER_EMAIL_ADDRESS
  )

  return {
    pageTitle: isSection2
      ? 'Application received'
      : 'Self-assessment complete',
    submissionReference,
    helpText1: isSection2
      ? 'We’ve sent confirmation of this application to:'
      : 'We’ve also sent these details to:',
    applicantEmail,
    ownerEmail,
    helpText2: isSection2
      ? 'An expert will now check your application.'
      : 'You can sell or hire out the item at your own risk.',
    helpText3: isSection2
      ? 'Checks usually happen within 30 days, and we may contact you during this time if we require more information.'
      : 'If you do so, and we later discover that you’ve given us false information, you could be fined or prosecuted.',
    helpText4: isSection2
      ? 'If your application is approved, we will send you an exemption certificate so you can sell or hire out your item.'
      : 'This self-assessment lasts until the owner of the item changes.',
    helpText5: isSection2,
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

const _paymentFailed = state =>
  state && state.status && state.status === PaymentResult.FAILED

const _paymentError = state =>
  state && state.status && state.status === PaymentResult.ERROR

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
