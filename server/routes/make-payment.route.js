'use strict'

const AnalyticsService = require('../services/analytics.service')
const PaymentService = require('../services/payment.service')
const RedisHelper = require('../services/redis-helper.service')
const RedisService = require('../services/redis.service')

const { Paths, RedisKeys, Analytics } = require('../utils/constants')

const TARGET_COMPLETION_DATE_PERIOD_DAYS = 30

const handlers = {
  get: async (request, h) => {
    const isSection2 = await RedisHelper.isSection2(request)

    const [
      amount,
      submissionReference,
      description,
      applicantContactDetails
    ] = await Promise.all([
      RedisService.get(request, RedisKeys.PAYMENT_AMOUNT),
      RedisService.get(request, RedisKeys.SUBMISSION_REFERENCE),
      _getPaymentDescription(request, isSection2),
      RedisService.get(request, RedisKeys.APPLICANT_CONTACT_DETAILS)
    ])

    const response = await PaymentService.makePayment(
      parseInt(amount),
      submissionReference,
      description,
      applicantContactDetails.emailAddress
    )

    const submissionDate = new Date()
    const targetCompletionDate = new Date(submissionDate.getTime())
    targetCompletionDate.setDate(
      submissionDate.getDate() + TARGET_COMPLETION_DATE_PERIOD_DAYS
    )

    await RedisService.set(
      request,
      RedisKeys.SUBMISSION_DATE,
      submissionDate.toISOString()
    )

    if (isSection2) {
      await RedisService.set(
        request,
        RedisKeys.TARGET_COMPLETION_DATE,
        targetCompletionDate.toISOString()
      )
    }

    await RedisService.set(request, RedisKeys.PAYMENT_ID, response.payment_id)

    console.log(response)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.PAYMENT,
      action: `Submitted ${description}`,
      label: `Payment Amount: £${amount}`
    })

    return h.redirect(response._links.next_url.href)
  }
}

const _getPaymentDescription = async (request, isSection2) => {
  let paymentDescription

  if (isSection2) {
    const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

    paymentDescription = isAlreadyCertified
      ? 'Payment for an item that has been previously certified'
      : 'Payment for an exemption certificate application'
  } else {
    paymentDescription = 'Payment for the registration of an ivory item'
  }

  return paymentDescription
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MAKE_PAYMENT}`,
    handler: handlers.get
  }
]
