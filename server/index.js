'use strict'

const hapi = require('@hapi/hapi')
const Bcrypt = require('bcrypt')

const config = require('./utils/config')
const { options } = require('./utils/cookie-config')
const { DEFRA_IVORY_SESSION_KEY, Paths } = require('./utils/constants')

const CookieService = require('./services/cookie.service')

const users = {
  defra: {
    username: 'defra',
    password: '$2a$04$R/Iqfgw5oXbBd.ozznzZ9OThrl2E12B8zcPWsOKy/7s35D5cS.V/S'
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

  server.ext('onPreResponse', function (request, h) {
    return _checkSessionCookie(request, h)
  })

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

const _checkSessionCookie = (request, h) => {
  const pathname = request.url.pathname
  const excludeCookieCheckUrls = [
    '/',
    Paths.SERVICE_STATUS,
    Paths.SESSION_TIMED_OUT
  ]

  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/errors/') ||
    excludeCookieCheckUrls.includes(pathname) ||
    _isUnknownRoute(pathname)
  ) {
    return h.continue
  } else {
    if (!CookieService.checkSessionCookie(request)) {
      return h.redirect(Paths.SESSION_TIMED_OUT).takeover()
    } else {
      return h.continue
    }
  }
}

const _createSessionCookie = server => {
  server.state(DEFRA_IVORY_SESSION_KEY)
}

const _isUnknownRoute = pathname => {
  return !Object.values(Paths).includes(pathname)
}

module.exports = createServer
