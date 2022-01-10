const { Notifier } = require('@airbrake/node')
const config = require('../utils/config')
const { formatWithOptions, inspect } = require('util')
const INSPECT_OPTS = {
  depth: null,
  maxStringLength: null,
  maxArrayLength: null,
  breakLength: null,
  compact: true,
  showHidden: true
}

let airbrake = null

module.exports = {
  plugin: {
    name: 'airbrake',
    register: () => {
      if (!airbrake && config.airbrakeProjectKey && config.airbrakeHost) {
        airbrake = new Notifier({
          projectId: 1,
          projectKey: config.airbrakeProjectKey,
          host: config.airbrakeHost,
          environment: config.env,
          performanceStats: false
        })

        const nativeConsoleMethods = {}
        ;['warn', 'error'].forEach(method => {
          nativeConsoleMethods[method] = console[method].bind(console)
          console[method] = (...args) => {
            const error =
              args.find(arg => arg instanceof Error) ??
              new Error(formatWithOptions(INSPECT_OPTS, ...args))
            const request = args.find(arg =>
              Object.prototype.hasOwnProperty.call(arg, 'headers')
            )
            airbrake.notify({
              error,
              params: {
                consoleInvocationDetails: {
                  method,
                  arguments: { ...args.map(arg => inspect(arg, INSPECT_OPTS)) }
                }
              },
              environment: {
                // Support for PM2 process.env.name
                ...(process.env.name && { name: process.env.name })
              },
              ...(request?.state && { session: request?.state }),
              context: {
                ...(request?.method && {
                  action: `${request?.method?.toUpperCase()} ${request?.path}`
                }),
                ...(request?.headers?.['user-agent'] && {
                  userAgent: request?.headers?.['user-agent']
                })
              }
            })
            nativeConsoleMethods[method](...args)
          }
        })
      }
    }
  }
}
