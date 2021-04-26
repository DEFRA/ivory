'use strict'

const { Paths, Views } = require('../../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.ADDRESS_CONFIRM, {
      ..._getContext()
    })
  },
  post: async (request, h) => {
    return h.view(Views.CHECK_YOUR_ANSWERS)
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

module.exports = [
  {
    method: 'GET',
    path: `${Paths.OWNER_ADDRESS_CONFIRM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_ADDRESS_CONFIRM}`,
    handler: handlers.post
  }
]
