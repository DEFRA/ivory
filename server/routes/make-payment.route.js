'use strict'

const RandomString = require('randomstring')

// TODO GA
// const AnalyticsService = require('../services/analytics.service')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')

const { ItemType, Paths, RedisKeys } = require('../utils/constants')

const TARGET_COMPLETION_DATE_PERIOD_DAYS = 30

const handlers = {
  get: async (request, h) => {
    const amount = parseInt(
      await RedisService.get(request, RedisKeys.PAYMENT_AMOUNT)
    )

    const submissionReference = _generateSubmissionReference()

    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const isSection2 = itemType === ItemType.HIGH_VALUE

    const description = isSection2
      ? 'Ivory Act application for a certificate'
      : 'Ivory Act self-assessment'

    const applicantContactDetails = await RedisService.get(
      request,
      RedisKeys.APPLICANT_CONTACT_DETAILS
    )

    const response = await PaymentService.makePayment(
      amount,
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
 * Generates a random 8 character uppercase alphanumeric reference
 * @returns Reference
 */
const _generateSubmissionReference = () => {
  return RandomString.generate({
    length: 8,
    readable: true,
    charset: 'alphanumeric',
    capitalization: 'uppercase'
  })
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MAKE_PAYMENT}`,
    handler: handlers.get
  }
]
