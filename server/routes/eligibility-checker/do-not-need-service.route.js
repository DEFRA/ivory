'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  Analytics,
  Paths,
  RedisKeys,
  Species,
  Urls,
  Views
} = require('../../utils/constants')

const noneOfTheseOption = 'None of these'

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: Analytics.Action.DROPOUT,
      label: context.pageTitle
    })

    return h.view(Views.DO_NOT_NEED_SERVICE, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: `${Analytics.Action.SELECTED} Finish and redirect button`,
      label: context.pageTitle
    })

    return h.redirect(Urls.GOV_UK_TOP_OF_MAIN)
  }
}

const _getContext = async request => {
  const species = await RedisService.get(request, RedisKeys.WHAT_SPECIES)
  const hasSpecies = species && species !== noneOfTheseOption

  const isMuseum = await RedisService.get(request, RedisKeys.ARE_YOU_A_MUSEUM)

  const speciesList = Object.values(Species).map(item => item.toLowerCase())

  return {
    pageTitle: 'You don’t need to tell us about this item',
    hasSpecies,
    speciesList,
    isMuseum
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.post
  }
]
