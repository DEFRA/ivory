const { Notifier } = require('@airbrake/node')
const config = require('../utils/config')

module.exports = class airbrakeService {
  static initialise () {
    if (config.airbrakeProjectKey && config.airbrakeHost) {
      const airbrake = new Notifier({
        projectId: 1,
        projectKey: config.airbrakeProjectKey,
        host: config.airbrakeHost,
        environment: config.env,
        performanceStats: false
      })
      return airbrake
    } else {
      return false
    }
  }
}
