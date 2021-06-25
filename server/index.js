'use strict'

const hapi = require('@hapi/hapi')
const Bcrypt = require('bcrypt')

const config = require('./utils/config')
const { options } = require('./utils/cookie-config')
const { DEFRA_IVORY_SESSION_KEY } = require('./utils/constants')

const users = {
  defra: {
    username: 'defra',
    password: '$2a$04$cIFq2TKhfYzmccljQdnzp.57V8Az61o7SUIIfUK.Bioc49q7YhlLm'
  }
}

const createServer = async () => {
  const server = hapi.server({
    port: config.servicePort,
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
    state: options
  })

  _registerPlugins(server)

  _createSessionCookie(server)

  return server
}

const validate = async (request, username, password) => {
  const user = users[username]
  if (!user) {
    return { credentials: null, isValid: false }
  }

  const isValid = await Bcrypt.compare(password, user.password)
  const credentials = { id: user.id, name: user.name }

  return { isValid, credentials }
}

const _registerPlugins = async server => {
  if (config.useBasicAuth) {
    await server.register(require('@hapi/basic'))
    server.auth.strategy('simple', 'basic', { validate })
    server.auth.default('simple')
  }

  await server.register(require('./plugins/blipp.plugin'))
  await server.register(require('./plugins/disinfect.plugin'))
  await server.register(require('./plugins/error-pages.plugin'))
  await server.register(require('./plugins/hapi-sanitize-payload.plugin'))
  await server.register(require('./plugins/inert.plugin'))
  await server.register(require('./plugins/logging.plugin'))
  await server.register(require('./plugins/redis.plugin'))
  await server.register(require('./plugins/robots.plugin'))
  await server.register(require('./plugins/router.plugin'))
  await server.register(require('./plugins/views.plugin'))
}

const _createSessionCookie = server => {
  server.state(DEFRA_IVORY_SESSION_KEY)
}

module.exports = createServer
