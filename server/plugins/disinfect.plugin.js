'use strict'

// Disinfect plugin applies Google's Caja HTML Sanitizer on route query, payload, and params.
module.exports = {
  plugin: require('disinfect'),
  options: {
    disinfectQuery: true,
    disinfectParams: true,
    disinfectPayload: false
  }
}
