'use strict'

const config = require('../utils/config')

module.exports = {
  plugin: require('hapi-redis2'),
  options: {
    settings: {
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword
    },
    decorate: true
  }
}
