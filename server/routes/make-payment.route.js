'use strict'

const RandomString = require('randomstring')

const { Paths, RedisKeys } = require('../utils/constants')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

const handlers = {
  get: async (request, h) => {
    const amount = parseInt(
      await RedisService.get(request, RedisKeys.PAYMENT_AMOUNT)
    )

    const submissionReference = _generateReference()

    const description = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const email = await RedisService.get(
      request,
      RedisKeys.APPLICANT_EMAIL_ADDRESS
    )

    const response = await PaymentService.makePayment(
      amount,
      submissionReference,
      description,
      email
    )

    await RedisService.set(
      request,
      RedisKeys.SUBMISSION_DATE,
      new Date().toISOString()
    )

    await RedisService.set(
      request,
      RedisKeys.SUBMISSION_REFERENCE,
      submissionReference
    )

    await RedisService.set(request, RedisKeys.PAYMENT_ID, response.payment_id)

    return h.redirect(response._links.next_url.href)
  }
}

/**
 * Generates a random 6 character reference
 * @returns Reference
 */
const _generateReference = () => {
  return RandomString.generate({
    length: 6,
    charset: 'alphabetic'
  }).toUpperCase()
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MAKE_PAYMENT}`,
    handler: handlers.get
  }
]
