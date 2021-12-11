'use strict'

// const AnalyticsService = require('../services/analytics.service')
const ODataService = require('../../services/odata.service')

const { DataVerseFieldName } = require('../../utils/constants')
const { isPngImage } = require('../../utils/general')

const {
  // Analytics,
  DownloadReason,
  Paths
} = require('../../utils/constants')

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

const _getRecord = (id, key) => {
  return ODataService.getRecord(id, true, key, DownloadReason.SEND_DATA_TO_PI)
}

const _getImage = async (entity, index) => {
  const dataverseImageNameStub = DataVerseFieldName.PHOTO_1.slice(0, -1)

  const image = await ODataService.getImage(
    entity[DataVerseFieldName.SECTION_2_CASE_ID],
    `${dataverseImageNameStub}${index}`
  )

  const imageBuffered = await image.buffer()

  return imageBuffered
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.PASS_DATA_TO_PI_PHOTOS}`,
    handler: handlers.get
  }
]
