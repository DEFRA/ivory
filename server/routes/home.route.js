'use strict'

import { v4 as uuidv4 } from 'uuid';
import { HOME_URL, DEFRA_IVORY_SESSION_KEY, Paths } from '../utils/constants.js';

const handlers = {
  get: (request, h) => {
    _setCookieSessionId(h)

    return h.redirect(Paths.HOW_CERTAIN)
  }
}

const _setCookieSessionId = h => {
  h.state(DEFRA_IVORY_SESSION_KEY, uuidv4())
}

export default [
  {
    method: 'GET',
    path: HOME_URL,
    handler: handlers.get
  }
];
