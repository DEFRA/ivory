'use strict'

const os = require('os')
const { writeFileSync } = require('fs')

const RedisService = require('../services/redis.service')
const { Paths, Views } = require('../utils/constants')
const { buildErrorSummary } = require('../utils/validation')

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
  const files = ['lamp.png']

  const base64 = await RedisService.get(request, 'THE_IMAGE')
  const buff = Buffer.from(base64, 'base64')
  await writeFileSync(`${os.tmpdir()}/myfileX.jpg`, buff)

  return {
    pageTitle: 'Your photos',
    files
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
