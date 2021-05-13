'use strict'

const { Paths, RedisKeys, Views } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const itemType = 'musical' // temporary to deal with dynamic heading until parent page built. Values: 'musical', '10%' or 'other'
const highValue = false // temporary to deal with dynamic page content until parent page built

const handlers = {
  get: async (request, h) => {
    return h.view(Views.IVORY_AGE, {
      ..._getContext()
    })
  },
  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_AGE, {
          ..._getContext(),
          ..._getCheckboxes(payload),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    RedisService.set(request, RedisKeys.IVORY_AGE, _getIvoryAge(payload))

    if (itemType === '10%') {
      return h.redirect(Paths.IVORY_INTEGRAL)
    } else {
      return h.redirect(Paths.CHECK_YOUR_ANSWERS)
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

const _getMadeBefore = () => {
  if (itemType === 'musical') {
    return '1975'
  } else if (itemType === '10%') {
    return '3 March 1947'
  } else {
    return '1918'
  }
}

const _getContext = () => {
  const madeBefore = _getMadeBefore()
  if (highValue) {
    return {
      pageTitle: `How do you know the item was made before ${madeBefore}?`,
      checkbox4: `It’s been in the family since before ${madeBefore}`,
      checkbox6: 'It’s been carbon-dated'
    }
  } else {
    return {
      pageTitle: `How do you know the item was made before ${madeBefore}?`,
      checkbox4: `It’s been in the family since before ${madeBefore}`,
      checkbox6: 'Other'
    }
  }
}

const _getCheckboxes = payload => {
  const madeBefore = _getMadeBefore()
  if (payload.ivoryAge) {
    return {
      checkbox1Checked: payload.ivoryAge.includes('It has a stamp, serial number or signature to prove its age'),
      checkbox2Checked: payload.ivoryAge.includes('I have a dated receipt showing when it was bought or repaired'),
      checkbox3Checked: payload.ivoryAge.includes('I have a dated publication that shows or describes the item'),
      checkbox4Checked: payload.ivoryAge.includes(`It’s been in the family since before ${madeBefore}`),
      checkbox5Checked: payload.ivoryAge.includes('I have written verification from a relevant expert'),
      checkbox6Checked: payload.ivoryAge.includes('Other')
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
  } else if (payload.ivoryAge.includes('Other') && Validators.empty(payload.otherDetail)) {
    errors.push({
      name: 'otherDetail',
      text: 'You just tell us how you know the item’s age'
    })
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
