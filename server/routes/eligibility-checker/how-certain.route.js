'use strict'

const RandomString = require('randomstring')

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const { Analytics, Paths, Views, RedisKeys } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const completelyCertain = 'Completely'

const handlers = {
  get: (request, h) => {
    const context = _getContext(request)

    return h.view(Views.HOW_CERTAIN, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (payload.cookies) {
      h.state('CookieBanner', 'Hidden', {
        ttl: 24 * 60 * 60 * 1000 * 365, // 1 year
        path: '/'
      })
      return h.view(Views.HOW_CERTAIN, {
        ...context,
        hideBanner: true
      })
    }

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.HOW_CERTAIN, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const submissionReference = _generateSubmissionReference()

    await RedisService.set(
      request,
      RedisKeys.SUBMISSION_REFERENCE,
      submissionReference
    )

    await RedisService.set(
      request,
      RedisKeys.USED_CHECKER,
      payload.howCertain !== completelyCertain
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.howCertain}`,
      label: context.pageTitle
    })

    return h.redirect(
      payload.howCertain === completelyCertain
        ? Paths.WHAT_TYPE_OF_ITEM_IS_IT
        : Paths.CONTAIN_ELEPHANT_IVORY
    )
  }
}

const _getContext = request => {
  const hideBanner = request.state.CookieBanner
  return {
    pageTitle:
      'How certain are you that your item will qualify for exemption from the ban on dealing in ivory?',
    hideBanner
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.howCertain)) {
    errors.push({
      name: 'howCertain',
      text:
        'Tell us how certain you are that your item will qualify for exemption from the ban on dealing in ivory?'
    })
  }
  return errors
}

/**
 * Generates a random 8 character uppercase alphanumeric reference
 * @returns Reference
 */
const _generateSubmissionReference = () => {
  return RandomString.generate({
    length: 8,
    readable: true,
    charset: 'alphanumeric',
    capitalization: 'uppercase'
  })
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.post
  }
]
