'use strict'

const { Paths, Views } = require('../../../utils/constants')
const { buildErrorSummary, Validators } = require('../../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.ADDRESS_CHOOSE, {
      ..._getContext()
    })
  },
  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.ADDRESS_CHOOSE, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.view(Views.ADDRESS_OUTSIDE_UK)
  }
}

const _getContext = () => {
  // if (completedBy === 'owner') {
  //   return {
  //     title: 'What is your address?',
  //     helpText:
  //       'If your business is the legal owner of the item, give your business address.'
  //   }
  // } else {
  //   return {
  //     title: 'What is the owner’s address?',
  //     helpText:
  //       'If the legal owner of the item is a business, give the business address.'
  //   }
  // }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.address)) {
    errors.push({
      name: 'postcode',
      text: 'You must choose an address'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CHOOSE}`,
    handler: handlers.post
  }
]
