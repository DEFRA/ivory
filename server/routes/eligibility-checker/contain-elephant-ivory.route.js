'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  Analytics,
  Options,
  Paths,
  RedisKeys,
  Species,
  Urls,
  Views
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const {
  getStandardOptions,
  generateSubmissionReference
} = require('../../utils/general')

const handlers = {
  get: (_request, h) => {
    const context = _getContext()

    return h.view(Views.CONTAIN_ELEPHANT_IVORY, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.CONTAIN_ELEPHANT_IVORY, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.CONTAIN_ELEPHANT_IVORY,
      payload.containElephantIvory
    )

    await RedisService.set(request, RedisKeys.USED_CHECKER, true)

    if (payload.containElephantIvory === Options.NO) {
      await RedisService.set(request, RedisKeys.ARE_YOU_A_MUSEUM, false)
    }

    let submissionReference = await RedisService.get(
      request,
      RedisKeys.SUBMISSION_REFERENCE
    )

    if (!submissionReference) {
      submissionReference = generateSubmissionReference()

      await RedisService.set(
        request,
        RedisKeys.SUBMISSION_REFERENCE,
        submissionReference
      )
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.containElephantIvory}`,
      label: context.pageTitle
    })

    switch (payload.containElephantIvory) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_SPECIES,
          Species.ELEPHANT
        )
        return h.redirect(Paths.SELLING_TO_MUSEUM)
      case Options.NO:
        return h.redirect(Paths.WHAT_SPECIES)
      default:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Does your item contain elephant ivory?',
    helpText:
      'Any ivory in your item must be ‘worked’ ivory. This means it has been carved or significantly altered from its original raw state.',
    items: getStandardOptions(),
    guidanceUrl: Urls.GOV_UK_TOP_OF_MAIN
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.containElephantIvory)) {
    errors.push({
      name: 'containElephantIvory',
      text: 'Tell us whether your item contains elephant ivory'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CONTAIN_ELEPHANT_IVORY}`,
    handler: handlers.post
  }
]
