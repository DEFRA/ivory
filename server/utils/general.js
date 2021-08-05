'use strict'

const { DEFRA_IVORY_SESSION_KEY, Options } = require('./constants')

const addPayloadToContext = (request, context = {}) => {
  if (request && request.payload) {
    for (const fieldName in request.payload) {
      context[fieldName] = request.payload[fieldName]
    }
  }

  return context
}

const checkSessionCookie = request => {
  const sessionCookie = request.state[DEFRA_IVORY_SESSION_KEY]
  if (!sessionCookie) {
    console.log(`Session cookie not found for page ${request.url.pathname}`)
  }
  return sessionCookie
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

const getStandardOptions = (includeIdk = true) => {
  const items = [
    {
      value: Options.YES,
      text: Options.YES
    },
    {
      value: Options.NO,
      text: Options.NO
    }
  ]
  if (includeIdk) {
    items.push({
      value: Options.I_DONT_KNOW,
      text: Options.I_DONT_KNOW
    })
  }
  return items
}

module.exports = {
  addPayloadToContext,
  checkSessionCookie,
  convertToCommaSeparatedTitleCase,
  formatNumberWithCommas,
  getStandardOptions
}
