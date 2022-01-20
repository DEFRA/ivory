'use strict'

import config from '../utils/config.js'

import hapiRedis2 from 'hapi-redis2/lib/index.js'
export const { plugin } = hapiRedis2
export const { pkg } = hapiRedis2

const _getSettings = () => {
  const settings = {
    host: config.redisHost,
    port: config.redisPort
  }

  if (config.redisPassword) {
    settings.password = config.redisPassword
  }

  if (config.redisUseTls) {
    settings.tls = {}
  }

  return settings
}

export const options = {
    settings: _getSettings(),
    decorate: true
  }

export default { plugin, options }