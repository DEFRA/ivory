'use strict'

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const { Paths, Views, RedisKeys, Analytics } = require('../utils/constants')

const MAX_PHOTOS = 6

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    if (!context.uploadData || !context.uploadData.files.length) {
      return h.redirect(Paths.UPLOAD_DOCUMENT)
    }

    return h.view(Views.YOUR_DOCUMENTS, {
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

    return h.redirect(Paths.WHO_OWNS_ITEM)
  }
}

const _getContext = async request => {
  let uploadData = await RedisService.get(request, RedisKeys.UPLOAD_DOCUMENT)

  if (!uploadData) {
    uploadData = {
      files: [],
      fileData: [],
      fileSizes: []
    }
  }

  const rows = uploadData.files.map((file, index) => {
    return {
      key: {
        text: `File ${index + 1}`
      },
      classes: 'ivory-summary-list',
      value: {
        html: `<p id="filename-${index}">${file}</p>`
      },
      actions: {
        items: [
          {
            href: `/remove-document/${index + 1}`,
            text: 'Remove',
            visuallyHiddenText: `file ${index + 1}`
          }
        ]
      }
    }
  })

  return {
    uploadData,
    rows,
    pageTitle: 'Your supporting evidence',
    addPhotoUrl: Paths.UPLOAD_DOCUMENT,
    maxPhotos: MAX_PHOTOS,
    allowMorePhotos: uploadData.files.length < MAX_PHOTOS
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.YOUR_DOCUMENTS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.YOUR_DOCUMENTS}`,
    handler: handlers.post
  }
]
