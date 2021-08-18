'use strict'

const { Paths, Views, Urls } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    return h.view(Views.CANNOT_CONTINUE, {
      ..._getContext()
    })
  },

  post: (request, h) => {
    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'You cannot continue',
    helpText:
      'To use this service, you must know for sure whether your item qualifies for exemption.',
    callOutText:
      'You may need to get an expert to check it for you, such as an antiques dealer or auctioneer that specialises in ivory.',
    heading2: 'What you can do with this item',
    helpText2: 'In the meantime, your options include:'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CANNOT_CONTINUE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_CONTINUE}`,
    handler: handlers.post
  }
]
