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

  const haveOwnerPermission =
    'If you are not the owner of the item, you must have permission to act on their behalf.'

  const stopIfUnsure =
    'Stop at any point if you’re unsure about the right answer.'

  const certificateCancelledOrRevoked =
    "If we later find out that the information you’ve given is not accurate, the exemption certificate may be cancelled or 'revoked'."

  const certificateCancelledOrRevokedAlredyCertified =
    "If we later find out that the item has been damaged or altered, the exemption certificate is likely to be cancelled or 'revoked'. In this case a new application for an exemption certificate would have to be made before you can sell or hire out the item."

  if (!isSection2) {
    context.pageTitle =
      'Both the owner and applicant are jointly responsible for providing accurate information'
    context.helpTextParas = [
      'This is a self-declaration, both the owner and applicant are responsible for ensuring the item qualifies for exemption.',
      haveOwnerPermission,
      stopIfUnsure
    ]
  } else {
    context.pageTitle = isAlreadyCertified
      ? 'Both the owner and the person selling the certified item are jointly responsible for ensuring it remains exempt'
      : 'Both the owner and applicant are jointly responsible for providing accurate information'

    context.helpTextParas = [
      haveOwnerPermission,
      stopIfUnsure,
      isAlreadyCertified
        ? certificateCancelledOrRevokedAlredyCertified
        : certificateCancelledOrRevoked
    ]
  }

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
