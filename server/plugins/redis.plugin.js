'use strict'

const config = require('../utils/config')

module.exports = {
  plugin: require('hapi-redis2'),
  options: {
    settings: config.redisPassword
      ? {
          host: config.redisHost,
          port: config.redisPort
        }
      : {
          host: config.redisHost,
          port: config.redisPort,
          password: config.redisPassword
        },
    decorate: true
  }
}
