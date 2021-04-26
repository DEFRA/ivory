'use strict'

const { Paths, Views } = require('../../../utils/constants')
const { buildErrorSummary, Validators } = require('../../../utils/validation')

const resultSize = 100 // Temporary to be used until hooked up properly
const notOnList = false // Temporary to be used until hooked up properly

const handlers = {
  get: (request, h) => {
    return h.view(Views.ADDRESS_ENTER, {
      ..._getContext()
    })
  },
  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_ENTER, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    } else {
      return h.view(Views.ADDRESS_OUTSIDE_UK)
    }
  }
}

const _getContext = () => {
  if (notOnList === true) {
    return {
      title: 'Enter your address',
      helpText: 'If your business owns the item, give your business address.'
    }
  } else if (resultSize === 0) {
    return {
      title: 'No results, you will need to enter the address',
      helpText: 'If your business owns the item, give your business address.'
    }
  } else if (resultSize === 1) {
    return {
      title: 'Edit your address',
      helpText: 'If your business owns the item, give your business address.'
    }
  } else if (resultSize > 50) {
    return {
      title: 'Too many results, you will need to enter the address',
      helpText: 'If your business owns the item, give your business address.'
    }
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.addressLine1)) {
    errors.push({
      name: 'addressLine1',
      text: 'Enter the building and street information'
    })
  }

  if (Validators.empty(payload.addressTown)) {
    errors.push({
      name: 'addressTown',
      text: 'Enter a town or city'
    })
  }

  if (Validators.empty(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text: 'Enter the postcode'
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
    path: `${Paths.OWNER_ADDRESS_ENTER}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_ENTER}`,
    handler: handlers.post
  }
]
