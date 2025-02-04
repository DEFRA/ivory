'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const { Analytics, Paths, Views, RedisKeys } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const { generateSubmissionReference } = require('../../utils/general')

const completelyCertain = 'Yes, I know which exemption I need'

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

    const submissionReference = generateSubmissionReference()

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
        : Paths.SELLING_TO_MUSEUM
    )
  }
}

const _getContext = _request => {
  return {
    pageTitle: 'Do you know which exemption you want to register or apply for?'
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.howCertain)) {
    errors.push({
      name: 'howCertain',
      text:
        'Tell us how certain you are that your item will qualify for exemption from the ban on dealing in ivory'
    })
  }
  return errors
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
