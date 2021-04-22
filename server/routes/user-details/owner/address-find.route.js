'use strict'

const { postcodeValidator } = require('postcode-validator')
const { Paths, Views } = require('../../../utils/constants')
const AddressService = require('../../../services/address.service')

const completedBy = 'owner' // Temporary until previous page built then will use value saved in Redis. Use 'owner' or '3rdParty'

const handlers = {
  get: (request, h) => {
    return h.view(Views.ADDRESS_FIND, {
      ..._getContext()
    })
  },
  post: async (request, h) => {
    const payload = request.payload

    // If no postcode entered
    if (!payload.postcode) {
      return h.view(Views.ADDRESS_FIND, {
        ..._getContext,
        errorSummaryText: completedBy === 'owner' ? 'Enter your postcode' : 'Enter the owner’s postcode',
        errorText: {
          text: completedBy === 'owner' ? 'Enter your postcode' : 'Enter the owner’s postcode'
        }
      })
    // If an invalid postcode entered
    } else if (!postcodeValidator(payload.postcode, 'GB')) {
      return h.view(Views.ADDRESS_FIND, {
        ..._getContext,
        errorSummaryText: 'Enter a UK postcode in the correct format',
        errorText: {
          text: 'Enter a UK postcode in the correct format'
        }
      })
    } else {
      const test = await AddressService.addressSearch(payload.nameNumber, payload.postcode)
      console.log(test)
      const address = test.results
      return (address)
    }
  }
}

const _getContext = () => {
  if (completedBy === 'owner') {
    return {
      title: 'What is your address?',
      helpText: 'If your business is the legal owner of the item, give your business address.'
    }
  } else {
    return {
      title: 'What is the owner’s address?',
      helpText: 'If the legal owner of the item is a business, give the business address.'
    }
  }
}

module.exports = [{
  method: 'GET',
  path: `${Paths.OWNER_ADDRESS_FIND}`,
  handler: handlers.get
}, {
  method: 'POST',
  path: `${Paths.OWNER_ADDRESS_FIND}`,
  handler: handlers.post
}]
