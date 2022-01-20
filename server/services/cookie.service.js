'use strict'

import { DEFRA_IVORY_SESSION_KEY } from '../utils/constants.js';

export default class CookieService {
  static checkSessionCookie (request) {
    const sessionCookie = request.state[DEFRA_IVORY_SESSION_KEY]
    if (!sessionCookie) {
      console.log(`Session cookie not found for page ${request.url.pathname}`)
    }
    return sessionCookie
  }
};
