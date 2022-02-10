'use strict'

const fs = require('fs')
const path = require('path')
const { PDFDocument } = require('pdf-lib')

const AnalyticsService = require('../services/analytics.service')
const RedisService = require('../services/redis.service')
const AntimalwareService = require('../services/antimalware.service')

const config = require('../utils/config')
const { Paths, RedisKeys, Views, Analytics, uploadDocument } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')
const { checkForDuplicates, checkForFileSizeError } = require('../utils/upload')

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
      uploadData.files.length >= uploadDocument.MAX_DOCUMENTS
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
    let buffer

    const errors = _validateForm(payload, uploadData)

    if (!errors.length) {
      buffer = await _checkForVirus(
        request,
        payload,
        filename,
        uploadData,
        errors
      )
    }

    if (!errors.length) {
      if (filename.toUpperCase().endsWith(uploadDocument.PDF_EXTENSION)) {
        await _checkPdfEncryption(buffer, errors)
      }
    }

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
    } else {
      await RedisService.set(
        request,
        RedisKeys.UPLOAD_DOCUMENT,
        JSON.stringify(uploadData)
      )
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

  const hideHelpText = uploadData.files.length !== 0

  return {
    hideHelpText,
    uploadData,
    pageTitle: !hideHelpText
      ? 'Add evidence to support your case'
      : 'Add another file',
    accept: uploadDocument.ALLOWED_EXTENSIONS.join(','),
    fileListUrl: Paths.YOUR_DOCUMENTS,
    maximumFileSize: config.maximumFileSize
  }
}

const _validateForm = (payload, uploadData) => {
  const errors = []

  if (
    payload.files &&
    Array.isArray(payload.files) &&
    payload.files.length > uploadDocument.MAX_FILES_IN_REQUEST_PAYLOAD
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
    !uploadDocument.ALLOWED_EXTENSIONS.includes(
      path.extname(payload.files.filename).toUpperCase()
    )
  ) {
    // Note that this error should never happen because in the HTML we have specified attributes of:
    // - accept: ".pdf,.doc,.docx"
    errors.push({
      name: 'files',
      text:
        'The file must be a PDF, Microsoft Word document (.DOC or .DOCX) or image file'
    })
  } else if (checkForDuplicates(payload, uploadData)) {
    errors.push({
      name: 'files',
      text: "You've already uploaded that file. Choose a different one"
    })
  }

  return errors
}

const _checkForVirus = async (
  request,
  payload,
  filename,
  uploadData,
  errors
) => {
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

    return buffer
  } else {
    errors.push({
      name: 'files',
      text: 'The file could not be uploaded - try a different one'
    })
  }
}

const _checkPdfEncryption = async (buffer, errors) => {
  try {
    await PDFDocument.load(buffer)
  } catch (e) {
    const errorMessage = e.message.includes('is encrypted')
      ? 'The file is protected with a password'
      : 'The file could not could not be uploaded - try again'

    errors.push({
      name: 'files',
      text: errorMessage
    })
  }
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
