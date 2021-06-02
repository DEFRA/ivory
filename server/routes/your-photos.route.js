'use strict'

const os = require('os')
const { writeFileSync } = require('fs')

const RedisService = require('../services/redis.service')
const { Paths, Views, RedisKeys } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const MAX_PHOTOS = 2

const handlers = {
  get: async (request, h) => {
    return h.view(Views.YOUR_PHOTOS, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.YOUR_PHOTOS, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.redirect(Paths.WHO_OWNS_ITEM)
  }
}

const _getContext = async request => {
  const imageThumbnailFiles =
    JSON.parse(
      await RedisService.get(
        request,
        RedisKeys.UPLOAD_PHOTOS_THUMBNAIL_FILESLIST
      )
    ) || []

  for (const [index, thumbnailFilename] of imageThumbnailFiles.entries()) {
    const base64 = await RedisService.get(
      request,
      `${RedisKeys.UPLOAD_PHOTOS_THUMBNAIL_DATA}-${index + 1}`
    )

    const buff = Buffer.from(base64, 'base64')
    await writeFileSync(`${os.tmpdir()}/${thumbnailFilename}`, buff)
  }

  const rows = imageThumbnailFiles.map((imageThumbnailFile, index) => {
    return {
      key: {
        text: `Photo ${index + 1}`
      },
      classes: 'photo-summary-list',
      value: {
        html: `<img src="assets\\${imageThumbnailFile}" alt="Photo of item ${index}" width="200">`
      },
      actions: {
        items: [
          {
            // TODO Implement the Remove link
            href: '#',
            text: 'Remove',
            visuallyHiddenText: 'name'
          }
        ]
      }
    }
  })

  return {
    pageTitle: 'Your photos',
    files: imageThumbnailFiles,
    addPhotoUrl: Paths.UPLOAD_PHOTOS,
    maxPhotos: MAX_PHOTOS,
    rows,
    allowMorePhotos: imageThumbnailFiles.length < MAX_PHOTOS
  }
}

const _validateForm = payload => {
  const errors = []

  // TODO Validation

  return errors
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
