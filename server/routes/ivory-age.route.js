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

    if ((await _getItemType(request)) === ItemType.TEN_PERCENT) {
      return h.redirect(Paths.IVORY_INTEGRAL)
    } else {
      return h.redirect(Paths.UPLOAD_PHOTOS)
    }
  }
}

const _storeRedisValues = request => {
  const payload = request.payload

  if (!Array.isArray(payload.ivoryAge)) {
    request.payload.ivoryAge = [request.payload.ivoryAge]
  }

  console.log(payload)

  return RedisService.set(request, RedisKeys.IVORY_AGE, JSON.stringify(payload))
}

const _getItemType = async request => {
  return RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
}

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

  return [
    {
      label: AgeExemptionReasons.STAMP_OR_SERIAL,
      checked:
        ivoryAge && ivoryAge.includes(AgeExemptionReasons.STAMP_OR_SERIAL)
    },
    {
      label: AgeExemptionReasons.DATED_RECEIPT,
      checked: ivoryAge && ivoryAge.includes(AgeExemptionReasons.DATED_RECEIPT)
    },
    {
      label: AgeExemptionReasons.DATED_PUBLICATION,
      checked:
        ivoryAge && ivoryAge.includes(AgeExemptionReasons.DATED_PUBLICATION)
    },
    {
      label: madeBeforeOption,
      checked: ivoryAge && ivoryAge.includes(madeBeforeOption)
    },
    {
      label: AgeExemptionReasons.EXPERT_VERIFICATION,
      checked:
        ivoryAge && ivoryAge.includes(AgeExemptionReasons.EXPERT_VERIFICATION)
    },
    {
      label: AgeExemptionReasons.PROFESSIONAL_OPINION,
      checked:
        ivoryAge && ivoryAge.includes(AgeExemptionReasons.PROFESSIONAL_OPINION)
    },
    {
      label:
        itemType === ItemType.HIGH_VALUE
          ? AgeExemptionReasons.CARBON_DATED
          : AgeExemptionReasons.OTHER_REASON,
      checked:
        ivoryAge &&
        ivoryAge.includes(
          itemType === ItemType.HIGH_VALUE
            ? AgeExemptionReasons.CARBON_DATED
            : AgeExemptionReasons.OTHER_REASON
        )
    }
  ]
}

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
      text: 'You just tell us how you know the item’s age'
    })
  } else if (payload.ivoryAge.includes(AgeExemptionReasons.OTHER_REASON)) {
    if (Validators.empty(payload.otherReason)) {
      errors.push({
        name: 'otherReason',
        text: 'You just tell us how you know the item’s age'
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
