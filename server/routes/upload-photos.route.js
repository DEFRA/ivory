'use strict'

const os = require('os')
const { readFileSync, writeFileSync } = require('fs')

const RedisService = require('../services/redis.service')
const { Paths, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

const MAX_MEGABYES = 50

const MAX_FILES = 1

const handlers = {
  get: (request, h) => {
    return h.view(Views.UPLOAD_PHOTOS, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    const payload = request.payload
    console.log(payload)

    const errors = _validateForm(payload)
    if (errors.length) {
      return h
        .view(Views.UPLOAD_PHOTOS, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const file = readFileSync(payload.files.path)
    const buffer = Buffer.from(file)
    const base64 = buffer.toString('base64')

    RedisService.set(request, 'THE_IMAGE', base64)

    writeFileSync(`${os.tmpdir()}/myfile.jpg`, file)

    return h.redirect(Paths.YOUR_PHOTOS)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Add up to 6 photos of your item'
  }
}

const _validateForm = payload => {
  const errors = []

  if (
    payload.files &&
    Array.isArray(payload.files) &&
    payload.files.length > MAX_FILES
  ) {
    errors.push({
      name: 'files',
      text: 'Files must be uploaded one at a time'
    })
  } else if (payload.files.bytes === 0) {
    errors.push({
      name: 'files',
      text: 'File cannot be empty'
    })
  }

  // TODO Other validation

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
