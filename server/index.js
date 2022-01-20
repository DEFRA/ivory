import hapi from '@hapi/hapi'
import Bcrypt from 'bcrypt'
import config from './utils/config.js'
import * as cookieConfig from './utils/cookie-config.js'
import { DEFRA_IVORY_SESSION_KEY, Paths } from './utils/constants.js'
import CookieService from './services/cookie.service.js'
import * as hapiBasic from '@hapi/basic/lib/index.js'
import * as airbrakePlugin from './plugins/airbrake.plugin.js'
import * as blippPlugin from './plugins/blipp.plugin.js'
import * as disinfectPlugin from './plugins/disinfect.plugin.js'
import * as errorPagesPlugin from './plugins/error-pages.plugin.js'
import * as hapiGapiPlugin from './plugins/hapi-gapi.plugin.js'
import * as inertPlugin from './plugins/inert.plugin.js'
import * as loggingPlugin from './plugins/logging.plugin.js'
import * as redisPlugin from './plugins/redis.plugin.js'
import * as routerPlugin from './plugins/router.plugin.js'
import * as viewsPlugin from './plugins/views.plugin.js'

const { options } = cookieConfig

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
    await server.register(hapiBasic)
    server.auth.strategy('simple', 'basic', { validate })
    server.auth.default('simple')
  }

  await server.register(airbrakePlugin)
  await server.register(blippPlugin)
  await server.register(disinfectPlugin)
  await server.register(errorPagesPlugin)
  await server.register(hapiGapiPlugin)
  await server.register(inertPlugin)
  await server.register(loggingPlugin)
  await server.register(redisPlugin)
  await server.register(routerPlugin)
  await server.register(viewsPlugin)
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
    pathname.startsWith('/pass-data-to-pi/') ||
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

const _isUnknownRoute = pathname => !Object.values(Paths).includes(pathname)

export { createServer }

export default createServer
