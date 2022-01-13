'use strict'

const moment = require('moment')
const nodePackage = require('../../package.json')
const AntimalwareService = require('../services/antimalware.service')

const { Paths, Views } = require('../utils/constants')

const DATE_FORMAT_DMY_WITH_HMS = 'DD/MM/YYYY HH:mm:ss'

const handlers = {
  get: async (request, h) => {
    return h.view(Views.SERVICE_STATUS, {
      pageTitle: 'Service status',
      data: {
        name: nodePackage.name,
        version: nodePackage.version,
        clamVersion: await AntimalwareService.version(),
        addressLookupEnabled: process.env.ADDRESS_LOOKUP_ENABLED ? 'Yes' : 'No',
        rendered: moment(new Date()).format(DATE_FORMAT_DMY_WITH_HMS),
        uptime: moment(Date.now() - process.uptime() * 1000).format(
          DATE_FORMAT_DMY_WITH_HMS
        )
      },
      hideBackLink: true
    })
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_STATUS}`,
    handler: handlers.get
  }
]
