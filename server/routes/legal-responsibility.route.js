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

    if (context.isAlreadyCertified) {
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
  const isAlreadyCertified = await RedisHelper.isAlreadyCertified(request)

  const context = {
    isAlreadyCertified
  }

  if (!isSection2) {
    context.pageTitle =
      'Both the owner and applicant are jointly responsible for providing accurate information'
    context.helpTextParas = [
      'This is a self-declaration, both the owner and applicant are responsible for ensuring the item qualifies for exemption.',
      'If you are not the owner of the item, you must have permission to act on their behalf.',
      'Stop at any point if you’re unsure about the right answer.'
    ]
  } else {
    if (isAlreadyCertified) {
      context.pageTitle =
        'Both the owner and the person selling the certified item are jointly responsible for ensuring it remains exempt'
      context.helpTextParas = [
        'If you are not the owner of the item, you must have permission to act on their behalf.',
        'Stop at any point if you’re unsure about the right answer.',
        "If we later find out that the information you’ve given is not accurate, the exemption certificate may be cancelled or 'revoked'."
      ]
    } else {
      context.pageTitle =
        'Both the owner and applicant are jointly responsible for providing accurate information'
      context.helpTextParas = [
        'If you are not the owner of the item, you must have permission to act on their behalf.',
        'Stop at any point if you’re unsure about the right answer.',
        "If we later find out that the information you’ve given is not accurate, the exemption certificate may be cancelled or 'revoked'."
      ]
    }
  }

  context.callOutText = isSection2
    ? 'Dealing that relies on inaccurate information on the certificate may be a criminal offence. Anyone involved could be subject to a fine of up to £250,000, or 5 years imprisonment.'
    : 'If we later find out that any of the information you have given is incorrect, your registration may be cancelled. The applicant or owner may be subject to a fine of up to £250,000 or 5 years imprisonment.'

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
