/*
 * Add an `onPreResponse` listener to return error pages
 */

'use strict'

const { Paths, StatusCodes } = require('../utils/constants')

module.exports = {
  plugin: {
    name: 'error-pages',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          const statusCode = response.output.statusCode

          // Log the error
          request.log('error', {
            statusCode,
            message: response.message,
            stack: response.data ? response.data.stack : response.stack
          })

          if (statusCode === StatusCodes.PAGE_NOT_FOUND) {
            return h.redirect(Paths.PAGE_NOT_FOUND)
          }

          if (statusCode === StatusCodes.PAYLOAD_TOO_LARGE) {
            return h.redirect(request.route.path)
          }

          if (statusCode === StatusCodes.SERVICE_UNAVAILABLE) {
            return h.redirect(Paths.SERVICE_UNAVAILABLE)
          }

          return h.redirect(Paths.PROBLEM_WITH_SERVICE)
        }

        return h.continue
      })
    }
  }
}
