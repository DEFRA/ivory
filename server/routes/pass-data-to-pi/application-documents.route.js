'use strict'

// const AnalyticsService = require('../services/analytics.service')
const ODataService = require('../../services/odata.service')

const {
  // Analytics,
  Paths
} = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const id = request.query.record_id
    const key = request.query.key
    const filename = request.query.filename
    const dataverseFieldName = request.query.dataverseFieldName

    const entity = await _getRecord(id, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    const pdfDocument = await _getDocument(id, dataverseFieldName, key)
    const arrayBuffer = await pdfDocument.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return h
      .response(buffer)
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename=${filename}`)
      .takeover()
  }
}

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key)
}

const _getDocument = async (id, dataverseFieldName, key) => {
  return ODataService.getDocument(id, dataverseFieldName, true, key)
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_DOCUMENTS}`,
    handler: handlers.get
  }
]
