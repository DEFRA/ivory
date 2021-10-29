'use strict'

const AnalyticsService = require('../services/analytics.service')
const NotificationService = require('../services/notification.service')
const PaymentService = require('../services/payment.service')
const RedisService = require('../services/redis.service')
const { EmailTypes } = require('../utils/constants')

const {
  Analytics,
  ItemType,
  Options,
  Paths,
  PaymentResult,
  RedisKeys,
  Views
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const isSection2 = itemType === ItemType.HIGH_VALUE

    const ownedByApplicant =
      (await RedisService.get(request, RedisKeys.OWNED_BY_APPLICANT)) ===
      Options.YES

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

    const context = await _getContext(request, isSection2, ownedByApplicant)

    _sendEmail(
      request,
      EmailTypes.CONFIRMATION_EMAIL,
      context,
      itemType,
      isSection2
    )

    if (!ownedByApplicant && !isSection2) {
      _sendEmail(request, EmailTypes.EMAIL_TO_OWNER, context, itemType)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: context.pageTitle,
      label: context.pageTitle
    })

    return h.view(Views.SERVICE_COMPLETE, {
      ...context
    })
  }
}

const _getContext = async (request, isSection2, ownedByApplicant) => {
  const submissionReference = await RedisService.get(
    request,
    RedisKeys.SUBMISSION_REFERENCE
  )

  const ownerContactDetails = JSON.parse(
    (await RedisService.get(request, RedisKeys.OWNER_CONTACT_DETAILS)) || '{}'
  )

  const applicantContactDetails = JSON.parse(
    (await RedisService.get(request, RedisKeys.APPLICANT_CONTACT_DETAILS)) ||
      '{}'
  )

  return {
    ownerContactDetails,
    applicantContactDetails,
    submissionReference,
    applicantEmail: applicantContactDetails
      ? applicantContactDetails.emailAddress
      : null,
    ownerEmail:
      !ownedByApplicant && ownerContactDetails
        ? ownerContactDetails.emailAddress
        : null,

    pageTitle: isSection2 ? 'Application received' : 'Self-assessment complete',
    helpText1: isSection2
      ? 'We’ve sent confirmation of this application to:'
      : 'We’ve also sent these details to:',
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

const _paymentCancelled = state =>
  state &&
  state.status &&
  state.status === PaymentResult.FAILED &&
  state.code === PaymentResult.Codes.CANCELLED

const _paymentFailed = state =>
  state && state.status && state.status === PaymentResult.FAILED

const _paymentError = state =>
  state && state.status && state.status === PaymentResult.ERROR

const _sendEmail = async (
  request,
  emailType,
  context,
  itemType,
  isSection2
) => {
  let redisSentEmailKey
  let fullName
  let email

  if (emailType === EmailTypes.CONFIRMATION_EMAIL) {
    redisSentEmailKey = RedisKeys.EMAIL_CONFIRMATION_SENT
    fullName = context.applicantContactDetails.fullName
    email = context.applicantEmail
  } else if (emailType === EmailTypes.EMAIL_TO_OWNER) {
    redisSentEmailKey = RedisKeys.EMAIL_TO_OWNER_SENT
    fullName = context.ownerContactDetails.fullName
    email = context.ownerEmail
  }

  let messageSent = await RedisService.get(
    request,
    RedisKeys[redisSentEmailKey]
  )

  if (!messageSent) {
    const data = {
      fullName,
      exemptionType: itemType,
      submissionReference: context.submissionReference
    }

    messageSent = await NotificationService.sendEmail(
      emailType,
      isSection2,
      email,
      data
    )

    await RedisService.set(request, RedisKeys[redisSentEmailKey], messageSent)
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
