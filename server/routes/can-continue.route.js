'use strict'

const config = require('../utils/config')
const RedisService = require('../services/redis.service')
const {
  ItemType,
  Paths,
  RedisKeys,
  Views,
  Urls
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

    return h.redirect(Paths.LEGAL_REPONSIBILITY)
  }
}

const _getItemType = request => {
  return RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
}

const _usedChecker = async request => {
  return (await RedisService.get(request, RedisKeys.USED_CHECKER)) === 'true'
}

const _getContext = async request => {
  const usedChecker = await _usedChecker(request)

  const itemType = await _getItemType(request)

  const context = {
    isSection2: itemType === ItemType.HIGH_VALUE,
    usedChecker,
    additionalSteps: [],
    cancelLink: Urls.GOV_UK_HOME
  }

  let cost
  if (itemType === ItemType.HIGH_VALUE) {
    // Section 2
    context.pageTitle = usedChecker
      ? 'You can now apply for an exemption certificate'
      : 'You must now apply for an exemption certificate'

    context.additionalSteps.push(
      'Upload any documents that support your application.'
    )

    cost = config.paymentAmountBandB / 100
  } else {
    // Section 10
    context.pageTitle = usedChecker
      ? 'You can now make a self-assessment to sell or hire out your item'
      : 'You must now make a self-assessment to sell or hire out your item'

    cost = config.paymentAmountBandA / 100
  }

  context.additionalSteps.push('Provide contact details.')
  context.additionalSteps.push(
    `Pay a non-refundable administration fee of £${cost}.`
  )

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
