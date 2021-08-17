'use strict'

const os = require('os')
const { writeFileSync } = require('fs')

const RedisService = require('../services/redis.service')
const { Paths, Views, RedisKeys } = require('../utils/constants')

const MAX_PHOTOS = 6

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    if (!context.uploadData || !context.uploadData.files.length) {
      return h.redirect(Paths.UPLOAD_PHOTO)
    }

    return h.view(Views.YOUR_PHOTOS, {
      ...context
    })
  },

  post: async (request, h) => h.redirect(Paths.DESCRIBE_THE_ITEM)
}

const _getContext = async request => {
  const uploadData = JSON.parse(
    await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)
  ) || {
    files: [],
    fileData: [],
    fileSizes: [],
    thumbnails: [],
    thumbnailData: []
  }

  for (const [index, thumbnailFilename] of uploadData.thumbnails.entries()) {
    const buffer = Buffer.from(uploadData.thumbnailData[index], 'base64')
    await writeFileSync(`${os.tmpdir()}/${thumbnailFilename}`, buffer)
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
            visuallyHiddenText: 'name'
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
