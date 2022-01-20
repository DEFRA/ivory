'use strict'

import { Paths, Views } from '../utils/constants.js';

const handlers = {
  get: async (request, h) => {
    const context = _getContext()

    return h.view(Views.COOKIE_POLICY, {
      ...context
    })
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.COOKIE_POLICY}`,
    handler: handlers.get
  }
];

const _getContext = () => {
  return {
    pageTitle: 'Cookies'
  }
}
