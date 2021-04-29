'use strict'

const addPayloadToContext = (request, context = {}) => {
  if (request && request.payload) {
    for (const fieldName in request.payload) {
      context[fieldName] = request.payload[fieldName]
    }
  }

  return context
}

module.exports = {
  addPayloadToContext
}
