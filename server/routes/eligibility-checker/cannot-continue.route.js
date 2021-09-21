'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  Options,
  Paths,
  RedisKeys,
  Views,
  Urls,
  Analytics
} = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.SERVICE_COMPLETE,
      action: Analytics.Action.DROPOUT,
      label: context.pageTitle
    })

    return h.view(Views.CANNOT_CONTINUE, {
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

    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = async request => {
  const containsElephantIvoryIdk =
    (await RedisService.get(request, RedisKeys.CONTAIN_ELEPHANT_IVORY)) ===
    Options.I_DONT_KNOW

  return {
    pageTitle: 'You cannot continue',
    helpText1a: `To use this service, you must know for sure whether your item ${
      containsElephantIvoryIdk
        ? 'contains elephant ivory.'
        : 'qualifies for exemption.'
    }`,
    helpText1b: containsElephantIvoryIdk
      ? 'If you’re uncertain about your item and you choose to declare it anyway, we’ll assume it does contain elephant ivory.'
      : '',
    callOutText:
      'You may need to get an expert to check it for you, such as an antiques dealer or auctioneer that specialises in ivory.',
    heading2: 'What you can do with this item',
    helpText2: 'In the meantime, your options include:'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CANNOT_CONTINUE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_CONTINUE}`,
    handler: handlers.post
  }
]
