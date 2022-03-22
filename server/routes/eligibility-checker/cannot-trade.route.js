'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisHelper = require('../../services/redis-helper.service')

const { Paths, Views, Urls, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: Analytics.Action.DROPOUT,
      label: context.pageTitle
    })

    return h.view(Views.CANNOT_TRADE, {
      ...context
    })
  },

  post: async (request, h) => {
    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: `${Analytics.Action.SELECTED} Finish and redirect button`,
      label: 'Cannot Trade'
    })

    return h.redirect(Urls.GOV_UK_TOP_OF_MAIN)
  }
}

const _getContext = async request => {
  const species = (await RedisHelper.getSpecies(request)).toLowerCase()
  const referringUrl = request.headers.referer

  const pageTitle = 'You are not allowed to sell or hire out your item'

  if (referringUrl.includes(Paths.TAKEN_FROM_SPECIES)) {
    return {
      pageTitle,
      helpText: `Any replacement ivory in your item must have been taken from the ${species} before 1 January 1975.`
    }
  } else if (referringUrl.includes(Paths.MADE_BEFORE_1947)) {
    return {
      pageTitle,
      helpText: 'Your item must have been made before 3 March 1947.'
    }
  } else {
    return {
      pageTitle,
      helpText:
        'Your item does not meet any of the ivory ban exemption criteria.'
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.post
  }
]
