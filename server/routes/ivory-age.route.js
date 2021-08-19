'use strict'

const {
  AgeExemptionReasons,
  CharacterLimits,
  ItemType,
  Paths,
  RedisKeys,
  Views
} = require('../utils/constants')
const { formatNumberWithCommas } = require('../utils/general')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.IVORY_AGE, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_AGE, {
          ...(await _getContext(request)),
          otherReason: payload.otherReason ? payload.otherReason : '',
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await _storeRedisValues(request)

    if ((await _getItemType(request)) === ItemType.HIGH_VALUE) {
      return h.redirect(Paths.UPLOAD_DOCUMENT)
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

const _getItemType = async request =>
  RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = JSON.parse(await RedisService.get(request, RedisKeys.IVORY_AGE))
  }

  const itemType = await _getItemType(request)
  const madeBeforeDate = _getMadeBeforeDate(itemType)

  return {
    pageTitle: `How do you know the item was made before ${madeBeforeDate}?`,
    options: await _getCheckboxes(payload, itemType),
    helpText: _getHelpText(itemType),
    otherReason:
      payload &&
      payload.ivoryAge &&
      Array.isArray(payload.ivoryAge) &&
      payload.ivoryAge.includes(AgeExemptionReasons.OTHER_REASON)
        ? payload.otherReason
        : null,
    otherReasonCheckboxIndex: 7
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
    // _getCheckbox(
    //   ivoryAge,
    //   itemType === ItemType.HIGH_VALUE
    //     ? AgeExemptionReasons.CARBON_DATED
    //     : AgeExemptionReasons.OTHER_REASON
    // )
    // _getCheckbox(ivoryAge, AgeExemptionReasons.OTHER_REASON)
  ]

  if (itemType === ItemType.HIGH_VALUE) {
    checkboxes.push(_getCheckbox(ivoryAge, AgeExemptionReasons.CARBON_DATED))
  }

  checkboxes.push(_getCheckbox(ivoryAge, AgeExemptionReasons.OTHER_REASON))

  // console.log(checkboxes)

  return checkboxes
}

const _getCheckbox = (ivoryAge, reason) => {
  return {
    label: reason,
    checked: ivoryAge && ivoryAge.includes(reason)
  }
}

const _getHelpText = itemType =>
  `You must keep any physical evidence that supports your answer. We may ask for it at a later date, ${
    itemType === ItemType.HIGH_VALUE
      ? 'when we check your application'
      : 'if we decide to check your self-assessment'
  }.`

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

  if (Validators.empty(payload.ivoryAge)) {
    errors.push({
      name: 'ivoryAge',
      text: 'You must tell us how you know the item’s age'
    })
  } else if (payload.ivoryAge.includes(AgeExemptionReasons.OTHER_REASON)) {
    if (Validators.empty(payload.otherReason)) {
      errors.push({
        name: 'otherReason',
        text: 'You must tell us how you know the item’s age'
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
