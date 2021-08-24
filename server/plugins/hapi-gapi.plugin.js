'use strict'

const { DEFRA_IVORY_SESSION_KEY } = require('../utils/constants')
const config = require('../utils/config')

// Google analytics platform integration for hapi
module.exports = {
  plugin: require('@defra/hapi-gapi'),
  options: {
    propertySettings: [
      {
        id: config.googleAnalyticsId,
        hitTypes: ['pageview', 'event', 'ecommerce']
      }
    ],
    sessionIdProducer: async request => {
      // Would normally use the request object to retrieve the proper session identifier
      return request.state[DEFRA_IVORY_SESSION_KEY]
    },
    batchSize: 20,
    batchInterval: 15000
  }
}
