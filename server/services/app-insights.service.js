'use strict'

const applicationinsights = require('applicationinsights')
const config = require('../utils/config')

module.exports = class AppInsightsService {
  initialise () {
    if (config.appInsightsConnectionString) {
      applicationinsights.setup(config.appInsightsConnectionString).start()
      console.log('Application Insights started')
    } else {
      console.log('Application Insights disabled')
    }
  }
}
