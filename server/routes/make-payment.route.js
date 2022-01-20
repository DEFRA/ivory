'use strict'

import RandomString from 'randomstring';

// TODO IVORY-557
// const AnalyticsService = require('../services/analytics.service')
import PaymentService from '../services/payment.service.js';

import RedisHelper from '../services/redis-helper.service.js';
import RedisService from '../services/redis.service.js';
import { Paths, RedisKeys } from '../utils/constants.js';

const TARGET_COMPLETION_DATE_PERIOD_DAYS = 30

const handlers = {
  get: async (request, h) => {
    const isSection2 = await RedisHelper.isSection2(request)

    const amount = parseInt(
      await RedisService.get(request, RedisKeys.PAYMENT_AMOUNT)
    )

    const submissionReference = _generateSubmissionReference()

    const description = await _getPaymentDescription(request, isSection2)

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

export default [
  {
    method: 'GET',
    path: `${Paths.MAKE_PAYMENT}`,
    handler: handlers.get
  }
];
