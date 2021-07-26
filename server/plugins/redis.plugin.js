'use strict'

const config = require('../utils/config')

const _getSettings = () => {
  if (config.redisUseTls) {
    return {
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      tls: {}
    }
  } else if (config.redisPassword) {
    return {
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword
    }
  } else {
    return {
      host: config.redisHost,
      port: config.redisPort
    }
  }
}

module.exports = {
  plugin: require('hapi-redis2'),
  options: {
    settings: _getSettings(),
    decorate: true
  }
}
