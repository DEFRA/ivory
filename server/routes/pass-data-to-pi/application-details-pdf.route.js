'use strict'

// const AnalyticsService = require('../services/analytics.service')
const ODataService = require('../../services/odata.service')

const {
  // Analytics,
  Paths
} = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const id = request.params.id
    const key = request.params.key

    console.log('id:', id)
    console.log('key:', key)

    const entity = await _getRecord(id, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    // const pdfBytes = await _getPdf(entity)
    const pdfBytes = []

    return h
      .response(Buffer.from(pdfBytes))
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', 'inline; filename=certificate.pdf')
      .takeover()
  }
}

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key)
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_APPLICATION_PDF}`,
    handler: handlers.get
  }
]
