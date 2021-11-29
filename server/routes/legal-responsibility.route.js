'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const RedisHelper = require('../services/redis-helper.service')

const { Paths, RedisKeys, Views, Analytics } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.LEGAL_REPONSIBILITY, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.CONTINUE,
      label: context.pageTitle
    })

    const uploadData = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

    const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

    if (isAlreadyCertified) {
      return h.redirect(Paths.WHO_OWNS_ITEM)
    } else {
      return uploadData && uploadData.files && uploadData.files.length
        ? h.redirect(Paths.YOUR_PHOTOS)
        : h.redirect(Paths.UPLOAD_PHOTO)
    }
  }
}

const _getContext = async request => {
  const isSection2 = await RedisHelper.isSection2(request)

  const context = {}

  if (isSection2) {
    context.pageTitle =
      'Both the owner and applicant are jointly responsible for providing accurate information when making an application'

    context.helpTextParas = [
      'The Ivory Act 2018 permits you to do an application for someone else, but you must have permission to act on their behalf.'
    ]
    context.callOutText =
      'If we later find out that the information you’ve given is not accurate, the applicant or owner could be fined or prosecuted.'
  } else {
    context.pageTitle =
      'Both the owner and applicant are jointly responsible for providing accurate information within the self-assessment'

    context.helpTextParas = [
      'This is a self-assessment, both the owner and applicant are jointly responsible for ensuring the item is exempt.',
      'The Ivory Act 2018 permits you to do a self-assessment for someone else, but you must have permission to act on their behalf.'
    ]
    context.callOutText =
      'If we later find out that the item is not exempt, the applicant or owner could be fined or prosecuted.'
  }

  context.helpTextParas.push(
    'Stop at any point if you’re unsure about the right answer.'
  )

  return context
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.LEGAL_REPONSIBILITY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.LEGAL_REPONSIBILITY}`,
    handler: handlers.post
  }
]
