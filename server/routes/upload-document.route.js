'use strict'

const fs = require('fs')
const path = require('path')

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const AntimalwareService = require('../services/antimalware.service')

const config = require('../utils/config')
const { Paths, RedisKeys, Views, Analytics } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')
const { checkForDuplicates, checkForFileSizeError } = require('../utils/upload')

const MAX_DOCUMENTS = 6
const MAX_FILES_IN_REQUEST_PAYLOAD = 1
const ALLOWED_EXTENSIONS = ['.DOC', '.DOCX', '.PDF']

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    const uploadData = await RedisService.get(
      request,
      RedisKeys.UPLOAD_DOCUMENT
    )

    if (
      uploadData &&
      uploadData.files &&
      uploadData.files.length >= MAX_DOCUMENTS
    ) {
      return h.redirect(Paths.YOUR_DOCUMENTS)
    }

    const errors = await checkForFileSizeError(
      request,
      RedisKeys.UPLOAD_DOCUMENT_ERROR
    )

    return h.view(Views.UPLOAD_DOCUMENT, {
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
        .view(Views.UPLOAD_DOCUMENT, {
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
        const file = await fs.promises.readFile(payload.files.path)

        uploadData.files.push(filename)
        uploadData.fileSizes.push(payload.files.bytes)

        const buffer = Buffer.from(file)
        const base64 = buffer.toString('base64')
        uploadData.fileData.push(base64)

        await RedisService.set(
          request,
          RedisKeys.UPLOAD_DOCUMENT,
          JSON.stringify(uploadData)
        )
      } else {
        errors.push({
          name: 'files',
          text: 'The file could not be uploaded - try a different one'
        })
        return h.view(Views.UPLOAD_DOCUMENT, {
          ...context,
          ...buildErrorSummary(errors)
        })
      }
    } catch (error) {
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
          .view(Views.UPLOAD_DOCUMENT, {
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

    return h.redirect(Paths.YOUR_DOCUMENTS)
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

  const hideHelpText = uploadData.files.length

  return {
    hideHelpText,
    uploadData,
    pageTitle: !hideHelpText
      ? 'Add a document to support your case'
      : 'Add another document',
    accept: ALLOWED_EXTENSIONS.join(','),
    fileListUrl: Paths.YOUR_DOCUMENTS,
    maximumFileSize: config.maximumFileSize
  }
}

const _validateForm = (payload, uploadData) => {
  const errors = []

  if (
    payload.files &&
    Array.isArray(payload.files) &&
    payload.files.length > MAX_FILES_IN_REQUEST_PAYLOAD
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
    // - accept: ".pdf,.doc,.docx"
    errors.push({
      name: 'files',
      text: 'The file must be a PDF or Microsoft Word document (.DOC or .DOCX)'
    })
  } else if (checkForDuplicates(payload, uploadData)) {
    errors.push({
      name: 'files',
      text: "You've already uploaded that document. Choose a different one"
    })
  }

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
      plugins: {
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
