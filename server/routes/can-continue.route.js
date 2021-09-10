'use strict'

const config = require('../utils/config')
const RedisService = require('../services/redis.service')
const {
  ItemType,
  Paths,
  RedisKeys,
  Views,
  Urls,
  Analytics
} = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.CAN_CONTINUE, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const cost =
      (await _getItemType(request)) !== ItemType.HIGH_VALUE
        ? config.paymentAmountBandA
        : config.paymentAmountBandB

    await RedisService.set(request, RedisKeys.PAYMENT_AMOUNT, cost)

    await request.ga.event({
      category: Analytics.Category.EXEMPTION_TYPE,
      action: await _getItemType(request),
      label: `Eligibility Checker Used: ${await _usedChecker(request)}`
    })

    return h.redirect(Paths.LEGAL_REPONSIBILITY)
  }
}

const _getItemType = request =>
  RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)

const _usedChecker = async request =>
  (await RedisService.get(request, RedisKeys.USED_CHECKER)) === 'true'

const _getContext = async request => {
  const usedChecker = await _usedChecker(request)

  const itemType = await _getItemType(request)
  const isSection2 = itemType === ItemType.HIGH_VALUE

  const context = {
    usedChecker,
    isSection2: itemType === ItemType.HIGH_VALUE,
    additionalSteps: [],
    cancelLink: Urls.GOV_UK_HOME
  }

  let cost
  if (isSection2) {
    context.pageTitle = usedChecker
      ? 'You can now apply for an exemption certificate'
      : 'You must now apply for an exemption certificate'

    context.additionalSteps.push(
      'Upload any documents that support your application.'
    )

    cost = config.paymentAmountBandB / 100
  } else {
    context.pageTitle = usedChecker
      ? 'You can now make a self-assessment to sell or hire out your item'
      : 'You must now make a self-assessment to sell or hire out your item'

    cost = config.paymentAmountBandA / 100
  }

  context.additionalSteps.push('Provide contact details.')
  context.additionalSteps.push(
    `Pay ${
      isSection2 ? 'a non-refundable' : 'an'
    } administration fee of £${cost}.`
  )

  if (isSection2) {
    context.additionalSteps.push(
      'Wait 30 days for your application to be approved by an expert.'
    )
  }

  return context
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
