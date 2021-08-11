'use strict'

const fs = require('fs')

const path = require('path')

const config = require('../utils/config')
const RedisService = require('../services/redis.service')
const { Paths, RedisKeys, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const MAX_FILES = 1
const ALLOWED_EXTENSIONS = ['.DOC', '.PDF']

const handlers = {
  get: async (request, h) => {
    const errors = await _checkForFileSizeError(request)

    return h.view(Views.UPLOAD_DOCUMENT, {
      ...(await _getContext(request)),
      ...buildErrorSummary(errors)
    })
  },

  post: async (request, h) => {
    const payload = request.payload

    const context = await _getContext(request)

    const uploadData = context.uploadData

    const errors = _validateForm(payload, uploadData)

    if (errors.length) {
      return h
        .view(Views.UPLOAD_DOCUMENT, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    try {
      const filename = payload.files.filename

      const file = await fs.promises.readFile(payload.files.path)

      uploadData.files.push(filename)
      uploadData.fileSizes.push(payload.files.bytes)

      const buffer = Buffer.from(file)
      const base64 = buffer.toString('base64')
      uploadData.fileData.push(base64)

      RedisService.set(
        request,
        RedisKeys.UPLOAD_DOCUMENT,
        JSON.stringify(uploadData)
      )

      return h.redirect(Paths.YOUR_DOCUMENTS)
    } catch (error) {
      const errors = []
      errors.push({
        name: 'files',
        text: error.message
      })

      if (errors.length) {
        return h
          .view(Views.UPLOAD_DOCUMENT, {
            ...(await _getContext(request)),
            ...buildErrorSummary(errors)
          })
          .code(400)
      }
    }
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

  const hideHelpText = uploadData.files.length

  return {
    pageTitle: !hideHelpText
      ? 'Add a document to support your case'
      : 'Add another document',
    hideHelpText,
    accept: ALLOWED_EXTENSIONS.join(','),
    uploadData,
    fileListUrl: Paths.YOUR_DOCUMENTS,
    maximumFileSize: config.maximumFileSize
  }
}

const _validateForm = (payload, uploadData) => {
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
  } else if (
    !ALLOWED_EXTENSIONS.includes(
      path.extname(payload.files.filename).toUpperCase()
    )
  ) {
    // Note that this error should never happen because in the HTML we have specified attributes of:
    // - accept: ".jpg,.jpeg,.png"
    errors.push({
      name: 'files',
      text: 'The file must be a PDF or DOC'
    })
  } else if (_checkForDuplicates(payload, uploadData)) {
    errors.push({
      name: 'files',
      text: "You've already uploaded that document. Choose a different one"
    })
  }

  return errors
}

const _checkForDuplicates = (payload, uploadData) => {
  let duplicateFound

  if (uploadData.files && uploadData.fileSizes) {
    for (let i = 0; i < uploadData.files.length; i++) {
      if (
        uploadData.files[i] === payload.files.filename &&
        uploadData.fileSizes[i] === payload.files.bytes
      ) {
        duplicateFound = true
        break
      }
    }
  }

  return duplicateFound
}

const _checkForFileSizeError = async request => {
  const errors = []
  if (
    (await RedisService.get(request, RedisKeys.UPLOAD_DOCUMENT_ERROR)) ===
    'true'
  ) {
    errors.push({
      name: 'files',
      text: `The file must be smaller than ${config.maximumFileSize}mb`
    })
  }

  await RedisService.set(request, RedisKeys.UPLOAD_DOCUMENT_ERROR, false)

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.UPLOAD_DOCUMENT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.UPLOAD_DOCUMENT}`,
    handler: handlers.post,
    config: {
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
