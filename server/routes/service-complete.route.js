'use strict'

const AnalyticsService = require('../services/analytics.service')
const NotificationService = require('../services/notification.service')
const PaymentService = require('../services/payment.service')
const RedisHelper = require('../services/redis-helper.service')
const RedisService = require('../services/redis.service')
const {
  DEFRA_IVORY_SESSION_KEY,
  Options,
  ItemType
} = require('../utils/constants')
const config = require('../utils/config')
const {
  Analytics,
  Paths,
  PaymentResult,
  RedisKeys,
  Views
} = require('../utils/constants')

const APHA_EMAIL = 'IvoryAct@apha.gov.uk'
const SLA = 35

const handlers = {
  get: async (request, h) => {
    const itemType = await RedisHelper.getItemType(request)

    const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

    const isOwnedByApplicant = await RedisHelper.isOwnedByApplicant(request)

    const paymentFailedRoute = await _checkPaymentState(request)
    if (paymentFailedRoute) {
      return h.redirect(paymentFailedRoute)
    }

    const context = await _getContext(request, itemType, isOwnedByApplicant)

    if (!context.applicantContactDetails) {
      return h.redirect(Paths.SESSION_TIMED_OUT)
    }

    _sendEmails(context, isOwnedByApplicant, isAlreadyCertified)

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

const _getContext = async (request, itemType, ownedByApplicant) => {
  const isSection2 = itemType === ItemType.HIGH_VALUE

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
    itemType,
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

const _sendEmails = (context, isOwnedByApplicant, isAlreadyCertified) => {
  const isSection2 = context.itemType === ItemType.HIGH_VALUE

  isSection2
    ? _sendSection2Emails(context, isOwnedByApplicant, isAlreadyCertified)
    : _sendSection10Emails(context, isOwnedByApplicant)
}

const _sendSection2Emails = (
  context,
  isOwnedByApplicant,
  isAlreadyCertified
) => {
  if (isAlreadyCertified) {
    _sendSection2ResaleApplicantEmail(context)
  } else {
    _sendSection2ApplicantEmail(context)
  }

  const hasOwnerEmail =
    context.ownerContactDetails &&
    context.ownerContactDetails.hasEmailAddress === Options.YES

  if (!isOwnedByApplicant && hasOwnerEmail) {
    if (isAlreadyCertified) {
      _sendSection2OwnerEmailThirdPartyResale(context)
    } else {
      _sendSection2OwnerEmailThirdParty(context)
    }
  }
}

const _sendSection10Emails = (context, isOwnedByApplicant) => {
  _sendSection10ApplicantEmail(context)

  if (!isOwnedByApplicant) {
    const hasOwnerEmail =
      context.ownerContactDetails &&
      context.ownerContactDetails.hasEmailAddress === Options.YES

    if (hasOwnerEmail) {
      _sendSection10OwnerEmail(context)
    }
  }
}

const _sendSection2ApplicantEmail = context => {
  const templateId = config.govNotifyTemplateSection2ApplicantConfirmation
  const recipientEmail = context.applicantContactDetails.emailAddress
  const payload = {
    submissionReference: context.submissionReference,
    fullName: context.applicantContactDetails.fullName
  }

  _sendEmail(templateId, recipientEmail, payload)
}

const _sendSection2ResaleApplicantEmail = context => {
  const templateId = config.govNotifyTemplateSection2ResaleApplicantConfirmation
  const recipientEmail = context.applicantContactDetails.emailAddress
  const payload = {
    fullName: context.applicantContactDetails.fullName,
    certificateNumber: context.certificateNumber
  }

  _sendEmail(templateId, recipientEmail, payload)
}

const _sendSection2OwnerEmailThirdParty = context => {
  const templateId = config.govNotifyTemplateSection2OwnerEmailThirdParty
  const recipientEmail = context.ownerContactDetails.emailAddress
  const payload = {
    submissionReference: context.submissionReference,
    fullName:
      context.ownerContactDetails.fullName ||
      context.ownerContactDetails.businessName
  }

  _sendEmail(templateId, recipientEmail, payload)
}

const _sendSection2OwnerEmailThirdPartyResale = context => {
  const templateId = config.govNotifyTemplateSection2OwnerEmailThirdPartyResale
  const recipientEmail = context.ownerContactDetails.emailAddress
  const payload = {
    fullName:
      context.ownerContactDetails.fullName ||
      context.ownerContactDetails.businessName,
    certificateNumber: context.certificateNumber
  }

  _sendEmail(templateId, recipientEmail, payload)
}

const _sendSection10ApplicantEmail = context => {
  const templateId = config.govNotifyTemplateSection10ApplicantConfirmation
  const recipientEmail = context.applicantContactDetails.emailAddress
  const payload = {
    submissionReference: context.submissionReference,
    fullName: context.applicantContactDetails.fullName,
    exemptionType: context.itemType,
    isMuseum: context.itemType === ItemType.MUSEUM
  }

  _sendEmail(templateId, recipientEmail, payload)
}

const _sendSection10OwnerEmail = context => {
  const templateId = config.govNotifyTemplateSection10OwnerConfirmation
  const recipientEmail = context.ownerContactDetails.emailAddress
  const payload = {
    submissionReference: context.submissionReference,
    fullName: context.ownerContactDetails.fullName,
    exemptionType: context.itemType
  }

  _sendEmail(templateId, recipientEmail, payload)
}

const _sendEmail = async (templateId, recipientEmail, payload) => {
  await NotificationService.sendEmail(templateId, recipientEmail, payload)
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

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
