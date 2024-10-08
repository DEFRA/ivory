'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisHelper = require('../services/redis-helper.service')
const RedisService = require('../services/redis.service')

const config = require('../utils/config')
const {
  Analytics,
  Paths,
  RedisKeys,
  Urls,
  Views
} = require('../utils/constants')

const sessionTimeoutInHours = config.cookieTimeout / 1000 / 3600

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.CAN_CONTINUE, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)

    await RedisService.set(request, RedisKeys.PAYMENT_AMOUNT, context.cost)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.EXEMPTION_TYPE,
      action: context.itemType,
      label: `Eligibility Checker Used: ${context.hasUsedChecker}`
    })

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.CONTINUE,
      label: context.pageTitle
    })

    return h.redirect(Paths.LEGAL_REPONSIBILITY)
  }
}

const _getContext = async request => {
  const itemType = await RedisService.get(
    request,
    RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
  )

  const context = {
    sessionTimeoutInHours,
    itemType,
    isSection2: await RedisHelper.isSection2(request),
    hasUsedChecker: await RedisHelper.hasUsedChecker(request),
    isRevoked: await RedisHelper.isRevoked(request),
    hasAppliedBefore: await RedisHelper.hasAppliedBefore(request),
    isAlreadyCertified: await RedisHelper.isAlreadyCertified(request),
    cancelLink: Urls.GOV_UK_TOP_OF_MAIN
  }

  context.pageTitle = _getPageTitle(context)
  context.cost = _getCost(context)
  context.steps = _getSteps(context)

  return context
}

const _getPageTitle = context => {
  return context.isSection2
    ? _getSection2PageTitle(context)
    : 'You can now make a self-declaration to sell or hire out your item'
}

const _getSection2PageTitle = context => {
  let pageTitle

  if (context.isRevoked || context.hasAppliedBefore) {
    pageTitle =
      'You can now make a new application for an exemption certificate'
  } else if (context.isAlreadyCertified) {
    pageTitle =
      'Selling your certified item of outstandingly high artistic, cultural or historical value'
  } else {
    pageTitle = 'You can now apply for an exemption certificate'
  }

  return pageTitle
}

const _getSteps = context => {
  const stepOptions = {
    ADD_PHOTOS: 'Add up to 6 photos of the item.',
    DESCRIBE_ITEM: 'Describe the item and how it meets the exemption criteria.',
    PROVIDE_CONTACT_DETAILS: 'Provide contact details.',
    PAY_FEE: `Pay an administration fee of £${config.paymentAmountBandA /
      100}.`,
    UPLOAD_DOCUMENTS: 'Upload any documents that support your application.',
    PAY_NON_REFUNDABLE_FEE_20: `Pay a non-refundable administration fee of £${config.paymentAmountBandA /
      100}.`,
    PAY_NON_REFUNDABLE_FEE_250: `Pay a non-refundable administration fee of £${config.paymentAmountBandB /
      100}.`,
    DECLARE_ITEM_MEETS_CRITERIA:
      'Declare that the item in your opinion meets the relevant exemption criteria.',
    CONFIRM_STILL_ACCURATE:
      'Confirm the information on the certificate remains accurate and complete.',
    RECEIVE_CONFIRMATION:
      'Receive confirmation you can now sell or hire out your item.',
    WAIT: 'It may take up to approximately 3 months to assess your application.'
  }
  const steps = []

  if (context.isSection2) {
    if (context.isAlreadyCertified) {
      steps.push(stepOptions.PROVIDE_CONTACT_DETAILS)
      steps.push(stepOptions.CONFIRM_STILL_ACCURATE)
      steps.push(stepOptions.PAY_NON_REFUNDABLE_FEE_20)
      steps.push(stepOptions.RECEIVE_CONFIRMATION)
    } else {
      steps.push(stepOptions.ADD_PHOTOS)
      steps.push(stepOptions.DESCRIBE_ITEM)
      steps.push(stepOptions.UPLOAD_DOCUMENTS)
      steps.push(stepOptions.PROVIDE_CONTACT_DETAILS)
      steps.push(stepOptions.DECLARE_ITEM_MEETS_CRITERIA)
      steps.push(stepOptions.PAY_NON_REFUNDABLE_FEE_250)
      steps.push(stepOptions.WAIT)
    }
  } else {
    steps.push(stepOptions.ADD_PHOTOS)
    steps.push(stepOptions.DESCRIBE_ITEM)
    steps.push(stepOptions.PROVIDE_CONTACT_DETAILS)
    steps.push(stepOptions.DECLARE_ITEM_MEETS_CRITERIA)
    steps.push(stepOptions.PAY_FEE)
  }
  return steps
}

const _getCost = context => {
  return context.isSection2 && !context.isAlreadyCertified
    ? config.paymentAmountBandB
    : config.paymentAmountBandA
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CAN_CONTINUE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CAN_CONTINUE}`,
    handler: handlers.post
  }
]
