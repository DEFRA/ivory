'use strict'

import AnalyticsService from '../services/analytics.service.js';
import NotificationService from '../services/notification.service.js';
import PaymentService from '../services/payment.service.js';
import RedisHelper from '../services/redis-helper.service.js';
import RedisService from '../services/redis.service.js';
import { EmailTypes, DEFRA_IVORY_SESSION_KEY, Options } from '../utils/constants.js';
import { Analytics, Paths, PaymentResult, RedisKeys, Views } from '../utils/constants.js';

const APHA_EMAIL = 'ivory@apha.gov.uk'
const SLA = 35

const handlers = {
  get: async (request, h) => {
    const itemType = await RedisHelper.getItemType(request)
    const isSection2 = await RedisHelper.isSection2(request, itemType)

    const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

    const isOwnedByApplicant = await RedisHelper.isOwnedByApplicant(request)

    const ownerContactDetails = await RedisService.get(
      request,
      RedisKeys.OWNER_CONTACT_DETAILS
    )

    const hasOwnerEmail =
      ownerContactDetails && ownerContactDetails.hasEmailAddress === Options.YES

    const paymentFailedRoute = await _checkPaymentState(request)
    if (paymentFailedRoute) {
      return h.redirect(paymentFailedRoute)
    }

    const context = await _getContext(request, isSection2, isOwnedByApplicant)

    if (!context.applicantContactDetails) {
      return h.redirect(Paths.SESSION_TIMED_OUT)
    }

    _sendEmails(
      request,
      context,
      itemType,
      isSection2,
      isOwnedByApplicant,
      isAlreadyCertified,
      hasOwnerEmail
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: context.pageTitle,
      label: context.pageTitle
    })

    return h
      .view(Views.SERVICE_COMPLETE, {
        ...context
      })
      .unstate(DEFRA_IVORY_SESSION_KEY)
  }
}

const _checkPaymentState = async request => {
  const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)

  const payment = await PaymentService.lookupPayment(paymentId)

  let paymentFailedRoute = null

  if (_paymentCancelled(payment.state)) {
    paymentFailedRoute = Paths.CHECK_YOUR_ANSWERS
  } else if (_paymentFailed(payment.state)) {
    paymentFailedRoute = Paths.MAKE_PAYMENT
  } else if (_paymentError(payment.state)) {
    paymentFailedRoute = Paths.CHECK_YOUR_ANSWERS
  }

  return paymentFailedRoute
}

const _sendEmails = (
  request,
  context,
  itemType,
  isSection2,
  isOwnedByApplicant,
  isAlreadyCertified,
  hasOwnerEmail
) => {
  const emailType =
    isSection2 && isAlreadyCertified
      ? EmailTypes.CONFIRMATION_EMAIL_RESELLING
      : EmailTypes.CONFIRMATION_EMAIL

  _sendEmail(request, context, emailType, itemType, isSection2)

  if (!isOwnedByApplicant && !isSection2 && hasOwnerEmail) {
    _sendEmail(request, context, EmailTypes.EMAIL_TO_OWNER, itemType)
  }
}

const _getContext = async (request, isSection2, ownedByApplicant) => {
  const submissionReference = await RedisService.get(
    request,
    RedisKeys.SUBMISSION_REFERENCE
  )

  const ownerContactDetails = await RedisService.get(
    request,
    RedisKeys.OWNER_CONTACT_DETAILS
  )

  const applicantContactDetails = await RedisService.get(
    request,
    RedisKeys.APPLICANT_CONTACT_DETAILS
  )

  const alreadyCertified = isSection2
    ? await RedisService.get(request, RedisKeys.ALREADY_CERTIFIED)
    : null

  const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

  const certificateNumber =
    isSection2 && isAlreadyCertified ? alreadyCertified.certificateNumber : null

  return {
    isAlreadyCertified,
    ownerContactDetails,
    applicantContactDetails,
    submissionReference,
    certificateNumber,
    applicantEmail: applicantContactDetails
      ? applicantContactDetails.emailAddress
      : null,
    ownerEmail:
      !ownedByApplicant && ownerContactDetails
        ? ownerContactDetails.emailAddress
        : null,

    pageTitle: _getPageTitle(isSection2, isAlreadyCertified),
    initialHelpText: _getInitialHelpText(isSection2, isAlreadyCertified),
    nextSteps: _getNextSteps(isSection2, isAlreadyCertified),
    hideBackLink: true,
    aphaEmail: isSection2 && !isAlreadyCertified ? APHA_EMAIL : null,
    sla: SLA
  }
}

const _getPageTitle = (isSection2, isAlreadyCertified) => {
  let pageTitle

  if (isSection2) {
    pageTitle = isAlreadyCertified
      ? 'Submission received'
      : 'Application received'
  } else {
    pageTitle = 'Self-declaration complete'
  }

  return pageTitle
}

const _getInitialHelpText = (isSection2, isAlreadyCertified) => {
  let initialHelpText

  if (isSection2) {
    initialHelpText = isAlreadyCertified
      ? 'We’ve sent confirmation of this to:'
      : 'We’ve sent confirmation of this application to:'
  } else {
    initialHelpText = 'We’ve also sent these details to:'
  }

  return initialHelpText
}

const _getNextSteps = (isSection2, isAlreadyCertified) => {
  const helpText = []

  if (isSection2) {
    if (isAlreadyCertified) {
      helpText.push('You can now sell or hire out your item.')
      helpText.push(
        'You must pass on the item’s certificate to the new owner as part of the transaction.'
      )
    } else {
      helpText.push(
        'Your application will now be sent to an expert for assessment. '
      )
      helpText.push(
        `We’ll aim to let you know the outcome of your application within ${SLA}  working days, we’ll let you know if it is going to take longer.`
      )
      helpText.push(
        'Following advice from the expert, we will determine whether to award the item an exemption certificate. We’ll contact you if we need more information.'
      )
    }
  } else {
    helpText.push('You can sell or hire out the item at your own risk.')
    helpText.push(
      'If we later discover that any of the information you have given is incorrect, your registration may be cancelled, and you may be subject to a fine of up to £250,000, or 5 years imprisonment.'
    )
    helpText.push(
      'This registration expires when the owner of the item changes.'
    )
  }

  return helpText
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
  context,
  emailType,
  itemType,
  isSection2
) => {
  let redisSentEmailKey
  let fullName
  let email
  let certificateNumber

  if (emailType === EmailTypes.CONFIRMATION_EMAIL) {
    redisSentEmailKey = RedisKeys.EMAIL_CONFIRMATION_SENT
    fullName = context.applicantContactDetails.fullName
    email = context.applicantEmail
  } else if (emailType === EmailTypes.CONFIRMATION_EMAIL_RESELLING) {
    redisSentEmailKey = RedisKeys.EMAIL_CONFIRMATION_SENT
    fullName = context.applicantContactDetails.fullName
    email = context.applicantEmail
    certificateNumber = context.certificateNumber
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
      certificateNumber,
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

export default [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
];
