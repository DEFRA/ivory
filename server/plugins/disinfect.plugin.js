'use strict'

import disinfectPkg from 'disinfect/lib/index.js'
export const { plugin } = disinfectPkg
// Disinfect plugin applies Google's Caja HTML Sanitizer on route query, payload, and params.
export const disinfect = {
  plugin: plugin, 
  options: {
    disinfectQuery: true,
    disinfectParams: true,
    disinfectPayload: true
  }
}
export default disinfect
