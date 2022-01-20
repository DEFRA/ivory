'use strict'

import ODataService from '../../services/odata.service.js';
import { DownloadReason, Paths } from '../../utils/constants.js';

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

const _getRecord = (id, key) =>
  ODataService.getRecord(id, key, DownloadReason.SEND_DATA_TO_PI, true)

const _getDocument = async (id, dataverseFieldName) =>
  ODataService.getDocument(id, dataverseFieldName)

const _isPdf = filename =>
  filename.substring(filename.length - 4).toUpperCase() === '.PDF'

export default [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_DOCUMENTS}`,
    handler: handlers.get
  }
];
