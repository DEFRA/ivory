'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const {
  Analytics,
  Paths,
  RedisKeys,
  Species,
  SpeciesExtraOptions,
  Urls,
  Views
} = require('../utils/constants')

const { buildErrorSummary, Validators } = require('../utils/validation')

const COOKIE_TTL_DAYS = 365 // 1 year, three times out of four

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    const useChecker = request.query.useChecker

    if (useChecker) {
      await RedisService.set(request, RedisKeys.USE_CHECKER, true)
    }

    return h.view(Views.WHAT_SPECIES_EXPERT, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (payload.cookies) {
      h.state('CookieBanner', 'Hidden', {
        ttl: 24 * 60 * 60 * 1000 * COOKIE_TTL_DAYS,
        path: '/'
      })
      return h.view(Views.WHAT_SPECIES_EXPERT, {
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
        .view(Views.WHAT_SPECIES_EXPERT, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.whatSpecies}`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.WHAT_SPECIES,
      payload.whatSpecies
    )

    const useChecker = await getUseChecker(request)

    if (useChecker) {
      return h.redirect(Paths.SELLING_TO_MUSEUM)
    } else {
      return h.redirect(Paths.HOW_CERTAIN)
    }
  }
}

const _getContext = async request => {
  const hideBanner = request.state.CookieBanner
  return {
    pageTitle: 'Does your item contain ivory from a listed species?',
    speciesItems: await _getSpeciesItems(request),
    items: await _getOptions(request),
    guidanceUrl: Urls.GOV_UK_TOP_OF_MAIN,
    hideBanner
  }
}

const getUseChecker = async request => {
  const useChecker = await RedisService.get(request, RedisKeys.USE_CHECKER)

  if (useChecker) {
    await RedisService.set(request, RedisKeys.USED_CHECKER, true)
  }

  await RedisService.delete(request, RedisKeys.USE_CHECKER)

  return useChecker
}

const _getSpeciesItems = () => {
  return Object.values(Species)
}

const _getOptions = async request => {
  const whatSpecies = await RedisService.get(request, RedisKeys.WHAT_SPECIES)
  const useChecker = await RedisService.get(request, RedisKeys.USE_CHECKER)

  console.log('useChecker', useChecker)

  const speciesOptions = Object.values(Species).map(species => {
    return {
      value: species,
      text: species,
      checked: whatSpecies === species
    }
  })

  const otherOptions = [
    {
      value: SpeciesExtraOptions.NOT_SURE,
      text: SpeciesExtraOptions.NOT_SURE,
      checked: whatSpecies === SpeciesExtraOptions.NOT_SURE
    }
  ]

  const options = [...speciesOptions, ...otherOptions]

  return options
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whatSpecies)) {
    errors.push({
      name: 'whatSpecies',
      text: 'Select one of the options to continue.'
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
