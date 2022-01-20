'use strict'

import ODataService from '../../services/odata.service.js';
import { DataVerseFieldName } from '../../utils/constants.js';
import { isPngImage } from '../../utils/general.js';
import { DownloadReason, Paths } from '../../utils/constants.js';

const handlers = {
  get: async (request, h) => {
    const recordId = request.query.record_id
    const index = request.query.index
    const key = request.query.key

    const entity = await _getRecord(recordId, key)

    if (!entity) {
      return h.redirect(Paths.RECORD_NOT_FOUND)
    }

    const bufferedImage = await _getImage(entity, index)

    const isPng = isPngImage(bufferedImage.toString('base64'))

    return h
      .response(Buffer.from(bufferedImage))
      .header('Content-type', 'image/png')
      .header(
        'Content-Disposition',
        `inline; filename=photo.${isPng ? 'png' : 'jpeg'}`
      )
      .takeover()
  }
}

const _getRecord = (id, key) =>
  ODataService.getRecord(id, key, DownloadReason.SEND_DATA_TO_PI, true)

const _getImage = async (entity, index) => {
  const dataverseImageNameStub = DataVerseFieldName.PHOTO_1.slice(0, -1)

  return ODataService.getImage(
    entity[DataVerseFieldName.SECTION_2_CASE_ID],
    `${dataverseImageNameStub}${index}`
  )
}

export default [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_PHOTOS}`,
    handler: handlers.get
  }
];
