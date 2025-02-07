'use strict'

const config = require('../utils/config')

module.exports = {
  plugin: require('hapi-pino'),
  options: {
    logPayload: true,
    level: config.logLevel
  }
}
