'use strict'

const { DataVerseFieldName, Paths, Views } = require('../utils/constants')

const ODataService = require('../services/odata.service')

const handlers = {
  get: async (request, h) => {
    const id = request.params.id
    const section = request.params.section

    const isSection2 = section === '2'

    const entity = await _getRecord(id, isSection2)

    return h.view(Views.GET_RECORD, {
      ...(await _getContext(entity, section, isSection2))
    })
  }
}

const _getRecord = async (id, isSection2) => {
  return ODataService.getRecord(id, isSection2)
}

const _getContext = (entity, section, isSection2) => {
  return {
    pageTitle: 'Get record',
    section,
    id:
      entity[
        isSection2
          ? DataVerseFieldName.SECTION_2_CASE_ID
          : DataVerseFieldName.SECTION_10_CASE_ID
      ],
    entity: JSON.stringify(entity)
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.GET_RECORD}/{section}/{id}`,
    handler: handlers.get
  }
]
