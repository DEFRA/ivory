'use strict'

import config from '../utils/config.js';
import { Paths, Views } from '../utils/constants.js';

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.ACCESSIBILITY_STATEMENT, {
      ...context
    })
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.ACCESSIBILITY_STATEMENT}`,
    handler: handlers.get
  }
];

const _getContext = () => {
  return {
    pageTitle: `Accessibility statement for ‘${config.serviceName}’`,
    serviceName: config.serviceName
  }
}
