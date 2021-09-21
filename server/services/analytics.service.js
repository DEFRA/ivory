'use strict'

module.exports = class AnalyticsService {
  static sendEvent (request, event) {
    request.ga.event(event)
  }
}
