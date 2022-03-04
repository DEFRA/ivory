'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  Analytics,
  Paths,
  RedisKeys,
  Species,
  Urls,
  Views
} = require('../utils/constants')

const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.WHAT_SPECIES_EXPERT, {
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
        .view(Views.WHAT_SPECIES_EXPERT, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(request, RedisKeys.WHAT_SPECIES, payload.whatSpecies)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.whatSpecies}`,
      label: context.pageTitle
    })

    return h.redirect(Paths.WHAT_TYPE_OF_ITEM_IS_IT)
  }
}

const _getContext = async request => {
  return {
    pageTitle: 'What species of ivory does your item contain?',
    items: await _getOptions(request),
    eligibilityCheckerUrl: Paths.CONTAIN_ELEPHANT_IVORY,
    guidanceUrl: Urls.GOV_UK_TOP_OF_MAIN
  }
}

const _getOptions = async request => {
  const whatSpecies = await RedisService.get(request, RedisKeys.WHAT_SPECIES)

  const options = Object.values(Species).map(species => {
    return {
      value: species,
      text: species,
      checked: whatSpecies === species
    }
  })

  return options
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whatSpecies)) {
    errors.push({
      name: 'whatSpecies',
      text: 'You must tell us what species of ivory your item contains '
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHAT_SPECIES_EXPERT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHAT_SPECIES_EXPERT}`,
    handler: handlers.post
  }
]
