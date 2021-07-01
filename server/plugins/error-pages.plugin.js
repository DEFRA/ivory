/*
 * Add an `onPreResponse` listener to return error pages
 */

'use strict'

const { Paths, RedisKeys, StatusCodes } = require('../utils/constants')
const RedisService = require('../services/redis.service')

module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          const statusCode = response.output.statusCode

          // Log the error, unless it is just a basic authenication issue
          if (statusCode !== StatusCodes.UNAUTHORIZED) {
            request.log('error', {
              statusCode,
              message: response.message,
              stack: response.data ? response.data.stack : response.stack
            })
          }

          if (statusCode === StatusCodes.PAGE_NOT_FOUND) {
            return h.redirect(Paths.PAGE_NOT_FOUND)
          }

          if (statusCode === StatusCodes.REQUEST_TIMEOUT) {
            return h.redirect(Paths.UPLOAD_TIMEOUT)
          }

          if (statusCode === StatusCodes.PAYLOAD_TOO_LARGE) {
            if (request.route.path === Paths.UPLOAD_PHOTOS) {
              RedisService.set(request, RedisKeys.UPLOAD_PHOTOS_ERROR, true)
            }

            return h.redirect(request.route.path)
          }

          if (statusCode === StatusCodes.SERVICE_UNAVAILABLE) {
            return h.redirect(Paths.SERVICE_UNAVAILABLE)
          }

          if (statusCode !== StatusCodes.UNAUTHORIZED) {
            return h.redirect(Paths.PROBLEM_WITH_SERVICE)
          }
        }

        return h.continue
      })
    }
  }
}
