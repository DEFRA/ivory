/*
 * Add an `onPreResponse` listener to return error pages
 */

'use strict'

const { Paths, RedisKeys, StatusCodes } = require('../utils/constants')
const RedisService = require('../services/redis.service')

module.exports = {
  plugin: {
    name: 'error-pages',
    register: server => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          if (_canIgnoreError(request)) {
            return h.continue
          } else {
            const nextPath = _getErrorPagePath(request, response)
            if (nextPath) {
              return h.redirect(nextPath)
            }
          }
        }

        return h.continue
      })
    }
  }
}

const _canIgnoreError = request => {
  // 404 errors can be ignored when favicon.ico can't be found
  return request.path === '/favicon.ico'
}

const _getErrorPagePath = (request, response) => {
  let path
  const statusCode = response.output.statusCode

  if (statusCode !== StatusCodes.UNAUTHORIZED) {
    _logError(request, response, statusCode)
  }

  if (statusCode === StatusCodes.PAGE_NOT_FOUND) {
    path = Paths.PAGE_NOT_FOUND
  } else if (statusCode === StatusCodes.REQUEST_TIMEOUT) {
    path = Paths.UPLOAD_TIMEOUT
  } else if (statusCode === StatusCodes.PAYLOAD_TOO_LARGE) {
    RedisService.set(
      request,
      request.route.path === Paths.UPLOAD_PHOTO
        ? RedisKeys.UPLOAD_PHOTO_ERROR
        : RedisKeys.UPLOAD_DOCUMENT_ERROR,
      true
    )
    path = request.route.path
  } else if (statusCode === StatusCodes.SERVICE_UNAVAILABLE) {
    path = Paths.SERVICE_UNAVAILABLE
  } else if (statusCode !== StatusCodes.UNAUTHORIZED) {
    path = Paths.PROBLEM_WITH_SERVICE
  }

  return path
}

const _logError = (request, response, statusCode) => {
  request.log('error', {
    statusCode,
    message: response.message,
    stack: response.data ? response.data.stack : response.stack
  })
}
