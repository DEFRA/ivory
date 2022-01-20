'use strict'

import { DEFRA_IVORY_SESSION_KEY } from '../utils/constants.js'
import config from '../utils/config.js'
import hapiGapi from '@defra/hapi-gapi/lib/index.js'

// Google analytics platform integration for hapi
export const { plugin } = hapiGapi

export const options = {
    propertySettings: [
      {
        id: config.googleAnalyticsId,
        hitTypes: ['pageview', 'event']
      }
    ],
    // Would normally use the request object to retrieve the proper session identifier
    sessionIdProducer: async request => request.state[DEFRA_IVORY_SESSION_KEY]
};

export default { plugin, options }
