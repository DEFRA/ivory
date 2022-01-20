import config from '../utils/config.js'
import hapiPino from 'hapi-pino/index.js'

export const plugin = {
  plugin: hapiPino,
  options: {
    logPayload: true,
    prettyPrint: config.isDev,
    level: config.logLevel
  }
}
export default plugin
