'use strict'

const moment = require('moment')
const NodeClam = require('clamscan')
const nodePackage = require('../../package.json')

const { Paths, Views } = require('../utils/constants')

const DATE_FORMAT_DMY_WITH_HMS = 'DD/MM/YYYY HH:mm:ss'

const handlers = {
  get: async (request, h) => {
    return h.view(Views.SERVICE_STATUS, {
      pageTitle: 'Service status',
      data: {
        name: nodePackage.name,
        version: nodePackage.version,
        clamVersion: await _getClamVersion(),
        rendered: moment(new Date()).format(DATE_FORMAT_DMY_WITH_HMS),
        uptime: moment(Date.now() - process.uptime() * 1000).format(
          DATE_FORMAT_DMY_WITH_HMS
        )
      },
      hideBackLink: true
    })
  }
}

const _getClamVersion = async () => {
  const options = {
    removeInfected: false, // If true, removes infected files
    quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
    scanLog: null, // Path to a writeable log file to write scan results into
    debugMode: false, // Whether or not to log info/debug/error msgs to the console
    fileList: null, // path to file containing list of files to scan (for scanFiles method)
    scanRecursively: true, // If true, deep scan folders recursively
    clamscan: {
      path: '/usr/bin/clamscan', // Path to clamscan binary on your server
      db: null, // Path to a custom virus definition database
      scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
      active: true // If true, this module will consider using the clamscan binary
    }
  }

  try {
    const clamscan = await new NodeClam().init(options)
    return await clamscan.getVersion()
  } catch (err) {
    return err
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_STATUS}`,
    handler: handlers.get
  }
]
