'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')
const RedisHelper = require('../../services/redis-helper.service')

const {
  Analytics,
  Options,
  Paths,
  RedisKeys,
  Views
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions, getSpeciesString } = require('../../utils/general')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.TAKEN_FROM_SPECIES, {
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
        .view(Views.TAKEN_FROM_SPECIES, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.takenFromSpecies}`,
      label: context.pageTitle
    })

    if (payload.takenFromSpecies === Options.NO) {
      RedisService.set(
        request,
        RedisKeys.ALREADY_CERTIFIED,
        JSON.stringify({ alreadyCertified: Options.NO })
      )

      return h.redirect(
        (await RedisHelper.isSection2(request))
          ? Paths.APPLIED_BEFORE
          : Paths.CAN_CONTINUE
      )
    }

    return h.redirect(Paths.CANNOT_TRADE)
  }
}

const _getContext = async request => {
  const speciesValue = (await RedisHelper.getSpecies(request)).toLowerCase()

  const speciesString = getSpeciesString(speciesValue)

  return {
    pageTitle: 'Was the replacement ivory taken from a listed species on or after 1 January 1975?',
    items: getStandardOptions(),
    species: speciesString
  }
}

const _validateForm = (payload) => {
  const errors = []
  if (Validators.empty(payload.takenFromSpecies)) {
    errors.push({
      name: 'takenFromSpecies',
      text: 'You must tell us whether the replacement ivory was taken from a listed species on or after 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.TAKEN_FROM_SPECIES}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.TAKEN_FROM_SPECIES}`,
    handler: handlers.post
  }
]
