'use strict'

const { ItemType, Options } = require('./constants')

const MUSICAL_PERCENTAGE = 20
const NON_MUSICAL_PERCENTAGE = 10

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

const getIvoryVolumePercentage = itemType =>
  itemType === ItemType.MUSICAL ? MUSICAL_PERCENTAGE : NON_MUSICAL_PERCENTAGE

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

const PNG_IMAGE_REGEXP = /^iVBORw0KGgo/g

// Returns a boolean to indicate if the base64 string parameter contains a PNG image.
// All PNG images, when encoded in base64, begin with iVBORw0KGgo
// This is needed because when we get the image out of the Dataverse we don't know
// if it is PNG or JPEG.
const isPngImage = imageBase64 => imageBase64.match(PNG_IMAGE_REGEXP) !== null

module.exports = {
  addPayloadToContext,
  convertToCommaSeparatedTitleCase,
  formatNumberWithCommas,
  getIvoryVolumePercentage,
  getStandardOptions,
  isPngImage
}
