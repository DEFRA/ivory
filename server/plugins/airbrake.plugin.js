import notifierPkg from '@airbrake/node/dist/index.js'
import config from '../utils/config.js'
import nodeUtilPkg from 'node:util'
const { formatWithOptions, inspect } = nodeUtilPkg
const { Notifier } = notifierPkg

const INSPECT_OPTS = {
  depth: null,
  maxStringLength: null,
  maxArrayLength: null,
  breakLength: null,
  compact: true,
  showHidden: true
}

let airbrake = null

export const plugin = {
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

export default plugin
