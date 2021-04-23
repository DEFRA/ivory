'use strict'

const { Paths, Views } = require('../../../utils/constants')
const AddressService = require('../../../services/address.service')
const { buildErrorSummary, Validators } = require('../../../utils/validation')

const completedBy = 'owner' // Temporary until previous page built then will use value saved in Redis. Use 'owner' or '3rdParty'

const handlers = {
  get: (request, h) => {
    return h.view(Views.ADDRESS_FIND, {
      ..._getContext()
    })
  },
  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_FIND, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const test = await AddressService.addressSearch(
      payload.nameNumber,
      payload.postcode
    )
    console.log(test)
    const address = test.results
    return address
  }
}

const _getContext = () => {
  if (completedBy === 'owner') {
    return {
      title: 'What is your address?',
      helpText:
        'If your business is the legal owner of the item, give your business address.'
    }
  } else {
    return {
      title: 'What is the owner’s address?',
      helpText:
        'If the legal owner of the item is a business, give the business address.'
    }
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text:
        completedBy === 'owner'
          ? 'Enter your postcode'
          : 'Enter the owner’s postcode'
    })
  }

  if (!Validators.postcode(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text: 'Enter a UK postcode in the correct format'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_FIND}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_FIND}`,
    handler: handlers.post
  }
]
