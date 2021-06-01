'use strict'

const path = require('path')
const { readFileSync } = require('fs')
const sharp = require('sharp')

const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

// TODO: Confirm max individual file size
const MAX_MEGABYES = 32

const MAX_FILES = 1
const THUMBNAIL_WIDTH = 1000
const ALLOWED_EXTENSIONS = ['.JPG', '.JPEG', '.PNG']

const handlers = {
  get: async (request, h) => {
    return h.view(Views.UPLOAD_PHOTOS, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload

    const context = await _getContext(request)

    const errors = _validateForm(payload)
    if (errors.length) {
      return h
        .view(Views.UPLOAD_PHOTOS, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    try {
      const filename = payload.files.filename
      const extension = path.extname(filename)
      const file = readFileSync(payload.files.path)
      const filenameNoExtension = filename.substring(
        0,
        filename.length - extension.length
      )
      const thumbnailFilename = `${filenameNoExtension}-thumbnail${extension}`

      context.files.push(filename)
      context.thumbnails.push(thumbnailFilename)

      const photoIndex = context.files.length

      const buffer = Buffer.from(file)
      const base64 = buffer.toString('base64')

      RedisService.set(
        request,
        RedisKeys.UPLOAD_PHOTOS_IMAGE_FILELIST,
        JSON.stringify(context.files)
      )

      RedisService.set(
        request,
        `${RedisKeys.UPLOAD_PHOTOS_IMAGE_DATA}-${photoIndex}`,
        base64
      )

      const thumbnailBuffer = await sharp(buffer)
        .resize(THUMBNAIL_WIDTH, null, {
          withoutEnlargement: true
        })
        .toBuffer()

      RedisService.set(
        request,
        RedisKeys.UPLOAD_PHOTOS_THUMBNAIL_FILESLIST,
        JSON.stringify(context.thumbnails)
      )

      RedisService.set(
        request,
        `${RedisKeys.UPLOAD_PHOTOS_THUMBNAIL_DATA}-${photoIndex}`,
        thumbnailBuffer.toString('base64')
      )

      return h.redirect(Paths.YOUR_PHOTOS)
    } catch (error) {
      if (error.message === 'Input buffer contains unsupported image format') {
        error.message = 'Unrecognised image file format'
      }
      const errors = []
      errors.push({
        name: 'files',
        text: error.message
      })

      if (errors.length) {
        return h
          .view(Views.UPLOAD_PHOTOS, {
            ...(await _getContext(request)),
            ...buildErrorSummary(errors)
          })
          .code(400)
      }

      console.log(error)
    }
  }
}

const _getContext = async request => {
  let data = await RedisService.get(
    request,
    RedisKeys.UPLOAD_PHOTOS_IMAGE_FILELIST
  )
  const files = JSON.parse(data) || []

  data = await RedisService.get(
    request,
    RedisKeys.UPLOAD_PHOTOS_THUMBNAIL_FILESLIST
  )
  const thumbnails = JSON.parse(data) || []

  const hideHelpText = files.length

  return {
    pageTitle: !hideHelpText ? 'Add a photo of your item' : 'Add another photo',
    hideHelpText,
    files,
    thumbnails,
    yourPhotosUrl: Paths.YOUR_PHOTOS
  }
}

const _validateForm = payload => {
  const errors = []

  if (
    payload.files &&
    Array.isArray(payload.files) &&
    payload.files.length > MAX_FILES
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
      text: 'You must choose a file to upload'
    })
  } else if (payload.files.bytes === 0) {
    errors.push({
      name: 'files',
      text: 'The file cannot be empty'
    })
  } else if (payload.files.bytes > 1024 * 1024 * MAX_MEGABYES) {
    errors.push({
      name: 'files',
      text: `The file must be smaller than ${MAX_MEGABYES}MB`
    })
  } else if (
    !ALLOWED_EXTENSIONS.includes(
      path.extname(payload.files.filename).toUpperCase()
    )
  ) {
    // Note that this error should never happen because in the HTML we have specified attributes of:
    // - accept: ".jpg,.jpeg,.png"
    errors.push({
      name: 'files',
      text: 'The file must be a JPG or PNG'
    })
  }

  // TODO: max size
  // payload.maxBytes
  // Default value: 1048576 (1MB).
  // Limits the size of incoming payloads to the specified byte count.
  // Allowing very large payloads may cause the server to run out of memory.
  // Gives 413 error if breached
  // 413 Payload Too Large
  // Selecting a large file causes the browser to 'hang' before populating the input box

  // TODO: virus - The file contains a virus

  // TODO: some other reason - The file could not could not be uploaded - try again - Same as the catch??

  // TODO: pwd - The file is protected with a password - only DOC and PDF??? TBC

  // Do we care about preserving image filenames? - possibility of clases due to writing to temp file

  // Image resolution: can validate that file is a big enough height and width in pixels or big enough size

  // X-browser - POC works in Chrome and Firefox

  // Sharp: Node.js image resizing library - 1.1m weekly downloads

  // image resizing - thumbnails
  // File named wrong
  // add another feedback - multiple images in Redis

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_PHOTOS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_PHOTOS}`,
    handler: handlers.post,
    config: {
      payload: {
        maxBytes: 1024 * 1024 * MAX_MEGABYES,
        multipart: {
          output: 'file'
        },
        parse: true
      }
    }
  }
]
