'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  CharacterLimits,
  ItemType,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../utils/constants')
const {
  addPayloadToContext,
  formatNumberWithCommas
} = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const pageTitle = 'Tell us about the item'

const handlers = {
  get: async (request, h) => {
    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const context = await _getContext(request, itemType)

    return h.view(Views.DESCRIBE_THE_ITEM, {
      ...context
    })
  },

  post: async (request, h) => {
    const itemType = await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    )

    const context = await _getContext(request, itemType)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.DESCRIBE_THE_ITEM, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.DESCRIBE_THE_ITEM,
      JSON.stringify(payload)
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: JSON.stringify(payload),
      label: context.pageTitle
    })

    switch (itemType) {
      case ItemType.HIGH_VALUE:
        return h.redirect(Paths.WHY_IS_ITEM_RMI)
      case ItemType.MINIATURE:
        return h.redirect(Paths.IVORY_AGE)
      case ItemType.MUSEUM:
        return h.redirect(Paths.WHO_OWNS_ITEM)
      default:
        return h.redirect(Paths.IVORY_VOLUME)
    }
  }
}

const _getContext = async (request, itemType) => {
  const context = {
    pageTitle,
    isSection2: itemType === ItemType.HIGH_VALUE
  }

  const itemDescription = JSON.parse(
    await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
  )

  _addRedisDataToContext(context, itemDescription)

  addPayloadToContext(request, context)

  return context
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whatIsItem)) {
    errors.push({
      name: 'whatIsItem',
      text: 'You must tell us what the item is'
    })
  } else if (Validators.maxLength(payload.whatIsItem, CharacterLimits.Input)) {
    errors.push({
      name: 'whatIsItem',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to tell us what the item is`
    })
  }

  if (Validators.empty(payload.whereIsIvory)) {
    errors.push({
      name: 'whereIsIvory',
      text: 'You must tell us where the ivory is'
    })
  } else if (
    Validators.maxLength(payload.whereIsIvory, CharacterLimits.Input)
  ) {
    errors.push({
      name: 'whereIsIvory',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to tell us where the ivory is`
    })
  }

  if (Validators.maxLength(payload.uniqueFeatures, CharacterLimits.Input)) {
    errors.push({
      name: 'uniqueFeatures',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to describe any unique, identifying features`
    })
  }

  if (Validators.maxLength(payload.whereMade, CharacterLimits.Input)) {
    errors.push({
      name: 'whereMade',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to tell us where the item was made`
    })
  }

  if (Validators.maxLength(payload.whenMade, CharacterLimits.Input)) {
    errors.push({
      name: 'whenMade',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to tell us when the item was made`
    })
  }

  return errors
}

const _addRedisDataToContext = (context, itemDescription) => {
  if (itemDescription) {
    for (const fieldName in itemDescription) {
      context[fieldName] = itemDescription[fieldName]
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.DESCRIBE_THE_ITEM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.DESCRIBE_THE_ITEM}`,
    handler: handlers.post
  }
]
