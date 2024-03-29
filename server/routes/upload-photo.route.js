'use strict'

const fs = require('fs')

const path = require('path')
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

const AnalyticsService = require('../services/analytics.service')
const AntimalwareService = require('../services/antimalware.service')
const AzureBlobService = require('../services/azure-blob.service')
const RedisService = require('../services/redis.service')

const config = require('../utils/config')
const {
  Analytics,
  AzureContainer,
  Paths,
  RedisKeys,
  UploadPhoto,
  Views
} = require('../utils/constants')

const { buildErrorSummary } = require('../utils/validation')
const { checkForDuplicates, checkForFileSizeError } = require('../utils/upload')

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    const uploadData = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

    if (
      uploadData &&
      uploadData.files &&
      uploadData.files.length >= UploadPhoto.MAX_PHOTOS
    ) {
      return h.redirect(Paths.YOUR_PHOTOS)
    }

    const errors = await checkForFileSizeError(
      request,
      RedisKeys.UPLOAD_PHOTO_ERROR
    )

    return h.view(Views.UPLOAD_PHOTO, {
      ...context,
      ...buildErrorSummary(errors)
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const filename = payload.files.filename

    const uploadData = context.uploadData

    let errors = _validateForm(payload, uploadData)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.UPLOAD_PHOTO, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    try {
      const isInfected = await AntimalwareService.scan(
        request,
        payload.files.path,
        filename
      )

      if (!isInfected) {
        const extension = path.extname(filename)

        const file = await fs.promises.readFile(payload.files.path)

        const thumbnailFilename = `${uuidv4()}${extension}`

        uploadData.files.push(filename)
        uploadData.fileSizes.push(payload.files.bytes)
        uploadData.thumbnails.push(thumbnailFilename)

        const buffer = Buffer.from(file)

        const thumbnailBuffer = await sharp(buffer)
          .resize(UploadPhoto.THUMBNAIL_WIDTH, null, {
            withoutEnlargement: true
          })
          .toBuffer()

        uploadData.thumbnailData.push(thumbnailBuffer.toString('base64'))

        const blobName = AzureBlobService.getBlobName(
          request,
          RedisKeys.UPLOAD_PHOTO,
          thumbnailFilename
        )

        const result = await AzureBlobService.set(AzureContainer.Images, blobName, file)
        uploadData.urls.push(result._response.request.url)

        await RedisService.set(
          request,
          RedisKeys.UPLOAD_PHOTO,
          JSON.stringify(uploadData)
        )
      } else {
        errors.push({
          name: 'files',
          text: 'The file could not be uploaded - try a different one'
        })
        return h.view(Views.UPLOAD_PHOTO, {
          ...context,
          ...buildErrorSummary(errors)
        })
      }
    } catch (error) {
      if (error.message === 'Input buffer contains unsupported image format') {
        error.message = 'Unrecognised image file format'
      }
      errors = []
      errors.push({
        name: 'files',
        text: error.message
      })

      if (errors.length) {
        AnalyticsService.sendEvent(request, {
          category: Analytics.Category.ERROR,
          action: JSON.stringify(errors),
          label: context.pageTitle
        })

        return h
          .view(Views.UPLOAD_PHOTO, {
            ...context,
            ...buildErrorSummary(errors)
          })
          .code(400)
      }
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: context.pageTitle,
      label: `${filename} ${(payload.files.bytes / Math.pow(1024, 2)).toFixed(
        2
      )}MB`,
      value: (payload.files.bytes / 1024).toFixed()
    })

    return h.redirect(Paths.YOUR_PHOTOS)
  }
}

const _getContext = async request => {
  let uploadData = await RedisService.get(request, RedisKeys.UPLOAD_PHOTO)

  if (!uploadData) {
    uploadData = {
      files: [],
      fileSizes: [],
      thumbnails: [],
      thumbnailData: [],
      urls: []
    }
  }

  const hideHelpText = uploadData.files.length

  return {
    hideHelpText,
    uploadData,
    pageTitle: !hideHelpText ? 'Add a photo of your item' : 'Add another photo',
    accept: UploadPhoto.ALLOWED_EXTENSIONS.join(','),
    fileListUrl: Paths.YOUR_PHOTOS,
    maximumFileSize: config.maximumFileSize
  }
}

const _validateForm = (payload, uploadData) => {
  const errors = []

  if (
    payload.files &&
    Array.isArray(payload.files) &&
    payload.files.length > UploadPhoto.MAX_FILES_IN_REQUEST_PAYLOAD
  ) {
    // Note that this error should never happen because in the HTML we have not specified the attributes of:
    // - multiple: true
    errors.push({
      name: 'files',
      text: 'Files must be uploaded one at a time'
    })
  } else if (
    payload.files.headers['content-disposition'].includes('filename=""')
  ) {
    errors.push({
      name: 'files',
      text: 'You must choose a photo to upload'
    })
  } else if (payload.files.bytes === 0) {
    errors.push({
      name: 'files',
      text: 'The file cannot be empty'
    })
  } else if (
    !UploadPhoto.ALLOWED_EXTENSIONS.includes(
      path.extname(payload.files.filename).toUpperCase()
    )
  ) {
    // Note that this error should never happen because in the HTML we have specified attributes of:
    // - accept: ".jpg,.jpeg,.png"
    errors.push({
      name: 'files',
      text: 'The file must be a JPG or PNG'
    })
  } else if (checkForDuplicates(payload, uploadData)) {
    errors.push({
      name: 'files',
      text: "You've already uploaded that image. Choose a different one"
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_PHOTO}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_PHOTO}`,
    handler: handlers.post,
    options: {
      plugins: {
        // Disinfect disabled on this route as caused an issue with the payload code below.
        // Note that while the payload isn't being sanitised no text boxes allowing user input should be used on this page.
        disinfect: false
      },
      payload: {
        maxBytes: 1024 * 1024 * config.maximumFileSize,
        multipart: {
          output: 'file'
        },
        parse: true,
        timeout: config.requestTimeout
      }
    }
  }
]
