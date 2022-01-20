'use strict'

export default class AnalyticsService {
  static sendEvent (request, event) {
    request.ga.event(event)
  }
};
