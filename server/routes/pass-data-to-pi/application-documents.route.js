'use strict'

const ODataService = require('../../services/odata.service')

const { DownloadReason, Paths } = require('../../utils/constants')

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

    const bufferedDocument = await _getDocument(id, dataverseFieldName)

    console.log(bufferedDocument)

    return h
      .response(bufferedDocument)
      .header(
        'Content-Type',
        _isPdf(filename) ? 'application/pdf' : 'application/octet-stream'
      )
      .header('Content-Disposition', `inline; filename=${filename}`)
      .takeover()
  }
}

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key, DownloadReason.SEND_DATA_TO_PI)
}

const _getDocument = async (id, dataverseFieldName) => {
  return ODataService.getDocument(id, dataverseFieldName)
}

const _isPdf = filename => {
  return filename.substring(filename.length - 4).toUpperCase() === '.PDF'
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_DOCUMENTS}`,
    handler: handlers.get
  }
]
