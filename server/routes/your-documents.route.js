'use strict'

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
    await request.ga.event({
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.CONTINUE,
      label: (await _getContext(request)).pageTitle
    })

    return h.redirect(Paths.WHO_OWNS_ITEM)
  }
}

const _getContext = async request => {
  const uploadData = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_DOCUMENT)
  ) || {
    files: [],
    fileData: [],
    fileSizes: []
  }

  const rows = uploadData.files.map((file, index) => {
    return {
      key: {
        text: `Document ${index + 1}`
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
            visuallyHiddenText: 'name'
          }
        ]
      }
    }
  })

  return {
    uploadData,
    rows,
    pageTitle: 'Your documents',
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
