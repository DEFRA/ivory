'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisHelper = require('../services/redis-helper.service')
const RedisService = require('../services/redis.service')

const {
  AgeExemptionReasons,
  CharacterLimits,
  ItemType,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.IVORY_AGE, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.IVORY_AGE, {
          ...context,
          otherReason: payload.otherReason ? payload.otherReason : '',
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await _storeRedisValues(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.ivoryAge}`,
      label: context.pageTitle
    })

    if (await RedisHelper.isSection2(request, context.itemType)) {
      return h.redirect(Paths.WANT_TO_ADD_DOCUMENTS)
    } else {
      return h.redirect(Paths.WHO_OWNS_ITEM)
    }
  }
}

const _storeRedisValues = request => {
  const payload = request.payload

  if (!Array.isArray(payload.ivoryAge)) {
    request.payload.ivoryAge = [request.payload.ivoryAge]
  }

  return RedisService.set(request, RedisKeys.IVORY_AGE, JSON.stringify(payload))
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.IVORY_AGE)
  }

  const itemType = await RedisHelper.getItemType(request)
  const isSection2 = await RedisHelper.isSection2(null, itemType)

  const madeBeforeDate = _getMadeBeforeDate(itemType)

  const options = await _getCheckboxes(payload, itemType)
  const otherCheckbox = options.pop()

  const items = options.map(option => {
    return {
      value: option.label,
      text: option.label,
      checked: option.checked
    }
  })

  return {
    itemType,
    items,
    otherCheckbox,
    pageTitle: `How do you know the item was made before ${madeBeforeDate}?`,
    helpText: _getHelpText(isSection2),
    otherReason:
      payload &&
      payload.ivoryAge &&
      Array.isArray(payload.ivoryAge) &&
      payload.ivoryAge.includes(AgeExemptionReasons.OTHER_REASON)
        ? payload.otherReason
        : null
  }
}

const _getCheckboxes = async (payload, itemType) => {
  const madeBeforeOption = _getMadeBeforeOption(itemType)
  const ivoryAge = payload ? payload.ivoryAge : null

  const checkboxes = [
    _getCheckbox(ivoryAge, AgeExemptionReasons.STAMP_OR_SERIAL),
    _getCheckbox(ivoryAge, AgeExemptionReasons.DATED_RECEIPT),
    _getCheckbox(ivoryAge, AgeExemptionReasons.DATED_PUBLICATION),
    _getCheckbox(ivoryAge, madeBeforeOption),
    _getCheckbox(ivoryAge, AgeExemptionReasons.EXPERT_VERIFICATION),
    _getCheckbox(ivoryAge, AgeExemptionReasons.PROFESSIONAL_OPINION)
  ]

  if (await RedisHelper.isSection2(null, itemType)) {
    checkboxes.push(_getCheckbox(ivoryAge, AgeExemptionReasons.CARBON_DATED))
  }

  checkboxes.push(_getCheckbox(ivoryAge, AgeExemptionReasons.OTHER_REASON))

  return checkboxes
}

const _getCheckbox = (ivoryAge, reason) => {
  return {
    label: reason,
    checked: ivoryAge && ivoryAge.includes(reason)
  }
}

const _getHelpText = isSection2 =>
  !isSection2
    ? 'You must keep any physical evidence that supports your answer. We may ask for it at a later date, if we decide to check your self-declaration.'
    : null

const _getMadeBeforeDate = itemType => {
  if (itemType === ItemType.MUSICAL) {
    return '1975'
  } else if (itemType === ItemType.TEN_PERCENT) {
    return '3 March 1947'
  } else {
    return '1918'
  }
}

const _getMadeBeforeOption = itemType => {
  if (itemType === ItemType.MUSICAL) {
    return AgeExemptionReasons.BEEN_IN_FAMILY_1975
  } else if (itemType === ItemType.TEN_PERCENT) {
    return AgeExemptionReasons.BEEN_IN_FAMILY_1947
  } else {
    return AgeExemptionReasons.BEEN_IN_FAMILY_1918
  }
}

const _validateForm = payload => {
  const errors = []

  const errorMessage = 'You must tell us how you know the item’s age'

  if (Validators.empty(payload.ivoryAge)) {
    errors.push({
      name: 'ivoryAge',
      text: errorMessage
    })
  } else if (payload.ivoryAge.includes(AgeExemptionReasons.OTHER_REASON)) {
    if (Validators.empty(payload.otherReason)) {
      errors.push({
        name: 'otherReason',
        text: errorMessage
      })
    }

    if (Validators.maxLength(payload.otherReason, CharacterLimits.Input)) {
      errors.push({
        name: 'otherReason',
        text: `Enter no more than ${formatNumberWithCommas(
          CharacterLimits.Input
        )} characters`
      })
    }
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_AGE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_AGE}`,
    handler: handlers.post
  }
]
