'use strict'

const RandomString = require('randomstring')

const { ItemType, Paths, RedisKeys } = require('../utils/constants')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

const TARGET_COMPLETION_DATE_PERIOD_DAYS = 30

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

    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const isSection2 = itemType === ItemType.HIGH_VALUE
    if (isSection2) {
      await RedisService.set(
        request,
        RedisKeys.TARGET_COMPLETION_DATE,
        targetCompletionDate.toISOString()
      )
    }

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
