'use strict'

const addPayloadToContext = (request, context = {}) => {
  if (request && request.payload) {
    for (const fieldName in request.payload) {
      context[fieldName] = request.payload[fieldName]
    }
  }

  return context
}

const convertToCommaSeparatedTitleCase = value => {
  if (value) {
    value = value.replace(/(\r\n|\r|\n)/g, ', ')
    let words = value.split(' ')
    words = words.map(word => {
      word = word.toLowerCase()
      word = word.charAt(0).toUpperCase() + word.slice(1)
      return word
    })

    return words.join(' ')
  }
}

const formatNumberWithCommas = num => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

module.exports = {
  addPayloadToContext,
  convertToCommaSeparatedTitleCase,
  formatNumberWithCommas
}
