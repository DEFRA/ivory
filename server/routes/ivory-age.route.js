'use strict'

const {
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
          ...(await _getCheckboxes(request)),
          otherText: payload.otherDetail ? payload.otherDetail : '',
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(request, RedisKeys.IVORY_AGE, _getIvoryAge(payload))

    if ((await _getItemType(request)) === ItemType.TEN_PERCENT) {
      return h.redirect(Paths.IVORY_INTEGRAL)
    } else {
      return h.redirect(Paths.UPLOAD_PHOTOS)
    }
  }
}

const _getIvoryAge = payload => {
  let ivoryAge
  if (Array.isArray(payload.ivoryAge)) {
    ivoryAge = payload.ivoryAge.join('.\n')
  } else {
    ivoryAge = payload.ivoryAge
  }

  if (payload.ivoryAge.includes('Other')) {
    return `${ivoryAge}: ${payload.otherDetail}`
  } else {
    return ivoryAge
  }
}

const _getMadeBefore = itemType => {
  if (itemType === ItemType.MUSICAL) {
    return '1975'
  } else if (itemType === ItemType.TEN_PERCENT) {
    return '3 March 1947'
  } else {
    return '1918'
  }
}

const _getItemType = async request => {
  return await RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
}

const _getContext = async request => {
  const itemType = await _getItemType(request)
  const madeBefore = _getMadeBefore(itemType)
  return {
    pageTitle: `How do you know the item was made before ${madeBefore}?`,
    checkbox4: `It’s been in the family since before ${madeBefore}`,
    checkbox6:
      itemType === ItemType.HIGH_VALUE ? 'It’s been carbon-dated' : 'Other'
  }
}

const _getCheckboxes = async request => {
  const madeBefore = _getMadeBefore(await _getItemType(request))
  const ivoryAge = request.payload.ivoryAge
  if (ivoryAge) {
    return {
      checkbox1Checked: ivoryAge.includes(
        'It has a stamp, serial number or signature to prove its age'
      ),
      checkbox2Checked: ivoryAge.includes(
        'I have a dated receipt showing when it was bought or repaired'
      ),
      checkbox3Checked: ivoryAge.includes(
        'I have a dated publication that shows or describes the item'
      ),
      checkbox4Checked: ivoryAge.includes(
        `It’s been in the family since before ${madeBefore}`
      ),
      checkbox5Checked: ivoryAge.includes(
        'I have written verification from a relevant expert'
      ),
      checkbox6Checked: ivoryAge.includes('Other')
    }
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.ivoryAge)) {
    errors.push({
      name: 'ivoryAge',
      text: 'You just tell us how you know the item’s age'
    })
  } else if (payload.ivoryAge.includes('Other')) {
    if (Validators.empty(payload.otherDetail)) {
      errors.push({
        name: 'otherDetail',
        text: 'You just tell us how you know the item’s age'
      })
    }

    if (Validators.maxLength(payload.otherDetail, CharacterLimits.Input)) {
      errors.push({
        name: 'otherDetail',
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
