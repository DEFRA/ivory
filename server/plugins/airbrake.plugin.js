const { Notifier } = require('@airbrake/node')
const config = require('../utils/config')

module.exports = {
  plugin: {
    name: 'airbrake',
    register: (server, options) => {
      if (config.airbrakeProjectKey && config.airbrakeHost) {
        const airbrake = new Notifier({
          projectId: 1,
          projectKey: config.airbrakeProjectKey,
          host: config.airbrakeHost,
          environment: config.env,
          performanceStats: false
        })
        server.decorate('request', 'airbrake', airbrake)
      }
    }
  }
}
