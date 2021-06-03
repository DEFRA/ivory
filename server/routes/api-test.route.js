'use strict'

const fetch = require('node-fetch')
const { Paths, Views } = require('../utils/constants')
const config = require('../utils/config')

const handlers = {
  get: async (request, h) => {
    const url = `${config.serviceApiHost}:${config.serviceApiPort}`
    try {
      const response = await fetch(url)
      return h.view(Views.API_TEST, {
        pageTitle: response.status === 200 ? 'API is working' : 'Failed to connect to API',
        apiHost: config.serviceApiHost,
        apiPort: config.serviceApiPort
      })
    } catch (error) {
      return h.view(Views.API_TEST, {
        pageTitle: error,
        apiHost: config.serviceApiHost,
        apiPort: config.serviceApiPort
      })
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: Paths.API_TEST,
    handler: handlers.get
  }
]
