'use strict'

import moment from 'moment';
import nodePackage from '../../package.json';
import AntimalwareService from '../services/antimalware.service.js';
import { Paths, Views } from '../utils/constants.js';

const DATE_FORMAT_DMY_WITH_HMS = 'DD/MM/YYYY HH:mm:ss'

const handlers = {
  get: async (request, h) => {
    return h.view(Views.SERVICE_STATUS, {
      pageTitle: 'Service status',
      data: {
        name: nodePackage.name,
        version: nodePackage.version,
        clamVersion: await AntimalwareService.version(),
        rendered: moment(new Date()).format(DATE_FORMAT_DMY_WITH_HMS),
        uptime: moment(Date.now() - process.uptime() * 1000).format(
          DATE_FORMAT_DMY_WITH_HMS
        )
      },
      hideBackLink: true
    })
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.SERVICE_STATUS}`,
    handler: handlers.get
  }
];
