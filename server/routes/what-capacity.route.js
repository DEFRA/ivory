'use strict'

import AnalyticsService from '../services/analytics.service.js';
import RedisService from '../services/redis.service.js';
import { Capacities, CharacterLimits, Paths, RedisKeys, Views, Analytics } from '../utils/constants.js';
import { formatNumberWithCommas } from '../utils/general.js';
import { buildErrorSummary, Validators } from '../utils/validation.js';

const otherCapacity = 'Other'

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.WHAT_CAPACITY, {
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
        .view(Views.WHAT_CAPACITY, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    if (payload.whatCapacity !== otherCapacity) {
      delete payload.otherCapacity
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.whatCapacity}${
        payload.whatCapacity === otherCapacity
          ? ' - ' + payload.otherCapacity
          : ''
      }`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.WHAT_CAPACITY,
      JSON.stringify(payload)
    )

    return h.redirect(Paths.APPLICANT_CONTACT_DETAILS)
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    payload = await RedisService.get(request, RedisKeys.WHAT_CAPACITY)
  }

  const whatCapacity = payload ? payload.whatCapacity : null

  const options = _getOptions(whatCapacity)
  const otherOption = options.pop()

  return {
    otherOption,
    pageTitle: 'In what capacity are you making this declaration?',
    items: options,
    otherCapacity:
      payload && payload.whatCapacity === Capacities.OTHER
        ? payload.otherCapacity
        : null
  }
}

const _getOptions = whatCapacity => {
  const options = Object.values(Capacities).map(capacity => {
    return {
      label: capacity,
      checked: whatCapacity && whatCapacity === capacity
    }
  })

  const items = options.map(option => {
    return {
      text: option.label,
      value: option.label,
      checked: option.checked
    }
  })

  items[0].hint = {
    text: 'For example, an antiques dealer or auction house selling the item'
  }

  return items
}

const _validateForm = payload => {
  const errors = []
  const errorMessage =
    'Tell us in what capacity you are making this declaration'

  if (Validators.empty(payload.whatCapacity)) {
    errors.push({
      name: 'whatCapacity',
      text: errorMessage
    })
  }

  if (payload.whatCapacity === otherCapacity) {
    if (Validators.empty(payload.otherCapacity)) {
      errors.push({
        name: 'otherCapacity',
        text: errorMessage
      })
    }

    if (Validators.maxLength(payload.otherCapacity, CharacterLimits.Input)) {
      errors.push({
        name: 'otherCapacity',
        text: `Enter no more than ${formatNumberWithCommas(
          CharacterLimits.Input
        )} characters`
      })
    }
  }

  return errors
}

export default [
  {
    method: 'GET',
    path: `${Paths.WHAT_CAPACITY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHAT_CAPACITY}`,
    handler: handlers.post
  }
];
