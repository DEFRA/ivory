'use strict'

const os = require('os')
const fs = require('fs')

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')

const { Paths, Views, RedisKeys, Analytics } = require('../utils/constants')

const MAX_PHOTOS = 6

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    if (!context.uploadData || !context.uploadData.files.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.MAIN_QUESTIONS,
        action: `${Analytics.Action.REDIRECT} ${Paths.UPLOAD_PHOTO}`,
        label: context.pageTitle
      })

      return h.redirect(Paths.UPLOAD_PHOTO)
    }

    return h.view(Views.YOUR_PHOTOS, {
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

    return h.redirect(Paths.DESCRIBE_THE_ITEM)
  }
}

const _getContext = async request => {
  let uploadData = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  if (!uploadData) {
    uploadData = {
      files: [],
      fileData: [],
      fileSizes: [],
      thumbnails: [],
      thumbnailData: []
    }
  }

  const thumbnails = uploadData.thumbnails

  for (let i = 0; i < thumbnails.length; i++) {
    const buffer = await Buffer.from(uploadData.thumbnailData[i], 'base64')
    await fs.promises.writeFile(`${os.tmpdir()}/${thumbnails[i]}`, buffer)
  }

  const rows = uploadData.thumbnails.map((imageThumbnailFile, index) => {
    return {
      key: {
        text: `Photo ${index + 1}`
      },
      classes: 'ivory-summary-list',
      value: {
        html: `<img src="assets\\${imageThumbnailFile}" alt="Photo of item ${index}" width="200">`
      },
      actions: {
        items: [
          {
            href: `/remove-photo/${index + 1}`,
            text: 'Remove',
            visuallyHiddenText: `photo ${index + 1}`
          }
        ]
      }
    }
  })

  return {
    rows,
    uploadData,
    pageTitle: 'Your photos',
    addPhotoUrl: Paths.UPLOAD_PHOTO,
    maxPhotos: MAX_PHOTOS,
    allowMorePhotos: uploadData.files.length < MAX_PHOTOS
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.YOUR_PHOTOS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.YOUR_PHOTOS}`,
    handler: handlers.post
  }
]
