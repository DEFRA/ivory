'use strict'

import config from '../utils/config.js';
import { Paths, Views } from '../utils/constants.js';

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.PRIVACY_NOTICE, {
      ...context
    })
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.PRIVACY_NOTICE}`,
    handler: handlers.get
  }
];

const _getContext = () => {
  return {
    pageTitle: `Privacy notice: ${config.serviceName}`
  }
}
