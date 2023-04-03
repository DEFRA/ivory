'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const RedisHelper = require('../services/redis-helper.service')

const {
  CharacterLimits,
  ItemType,
  Options,
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
    const itemType = await RedisHelper.getItemType(request)

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

    if (payload && payload.hasDistinguishingFeatures !== Options.YES) {
      delete payload.distinguishingFeatures
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
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)
  }

  const hasDistinguishingFeatures = payload
    ? payload.hasDistinguishingFeatures
    : null

  const options = _getOptions(hasDistinguishingFeatures).slice(0, -1)
  const yesOption = options.shift()

  const context = {
    pageTitle,
    yesOption,
    items: options,
    isSection2: itemType === ItemType.HIGH_VALUE
  }

  _addRedisDataToContext(context, payload)

  addPayloadToContext(request, context)

  return context
}

const _validateForm = payload => {
  const errors = []

  _validateWhatIsItem(payload, errors)
  _validateWhereIsIvory(payload, errors)
  _validateDistinguishingFeatures(payload, errors)
  _validateWhereMade(payload, errors)
  _validateWhenMade(payload, errors)

  return errors
}

const _validateWhatIsItem = (payload, errors) => {
  if (Validators.empty(payload.whatIsItem)) {
    errors.push({
      name: 'whatIsItem',
      text: 'You must tell us what the item is'
    })
  } else if (Validators.maxLength(payload.whatIsItem, CharacterLimits.WhatIsTheItem)) {
    errors.push({
      name: 'whatIsItem',
      text: `You must use no more than ${formatNumberWithCommas(
        CharacterLimits.WhatIsTheItem
      )} characters to tell us what the item is`
    })
  }
}

const _validateWhereIsIvory = (payload, errors) => {
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
}

const _validateDistinguishingFeatures = (payload, errors) => {
  if (Validators.empty(payload.hasDistinguishingFeatures)) {
    errors.push({
      name: 'hasDistinguishingFeatures',
      text: 'You must tell us if the item has any distinguishing features'
    })
  }

  if (
    payload.hasDistinguishingFeatures === Options.YES &&
    Validators.empty(payload.distinguishingFeatures)
  ) {
    errors.push({
      name: 'distinguishingFeatures',
      text: 'You must give details about the item’s distinguishing features'
    })
  } else if (
    Validators.maxLength(payload.distinguishingFeatures, CharacterLimits.DistinguishingFeatures)
  ) {
    errors.push({
      name: 'distinguishingFeatures',
      text: `You must use no more than ${formatNumberWithCommas(
        CharacterLimits.DistinguishingFeatures
      )} characters to describe any distinguishing features`
    })
  }
}

const _validateWhereMade = (payload, errors) => {
  if (Validators.maxLength(payload.whereMade, CharacterLimits.Input)) {
    errors.push({
      name: 'whereMade',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to tell us where the item was made`
    })
  }
}

const _validateWhenMade = (payload, errors) => {
  if (Validators.maxLength(payload.whenMade, CharacterLimits.Input)) {
    errors.push({
      name: 'whenMade',
      text: `You must use fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters to tell us when the item was made`
    })
  }
}

const _addRedisDataToContext = (context, itemDescription) => {
  if (itemDescription) {
    for (const fieldName in itemDescription) {
      context[fieldName] = itemDescription[fieldName]
    }
  }
}

const _getOptions = hasDistinguishingFeatures => {
  const options = Object.values(Options).map(option => {
    return {
      label: option,
      checked: hasDistinguishingFeatures && hasDistinguishingFeatures === option
    }
  })

  return options.map(option => {
    return {
      text: option.label,
      value: option.label,
      checked: option.checked
    }
  })
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
