'use strict'

const applicationinsights = require('applicationinsights')
const config = require('../utils/config')

class AppInsightsService {
  static initialise () {
    if (config.appInsightsConnectionString) {
      applicationinsights.setup(config.appInsightsConnectionString).start()
    } else {
      console.error('Application Insights is disabled')
    }
  }
}

module.exports = AppInsightsService
