'use strict'

const { Paths, Views, Urls } = require('../../utils/constants')

const handlers = {
  get: (request, h) => {
    const referringUrl = request.headers.referer
    return h.view(Views.CANNOT_TRADE, {
      ..._getContext(referringUrl)
    })
  },

  post: (request, h) => {
    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = referringUrl => {
  const pageTitle = 'You are not allowed to sell or hire out your item'

  if (referringUrl.includes(Paths.TAKEN_FROM_ELEPHANT)) {
    return {
      pageTitle,
      helpText: 'Any replacement ivory in your item must have been taken from an elephant before 1 January 1975.'
    }
  } else if (referringUrl.includes(Paths.MADE_BEFORE_1947)) {
    return {
      pageTitle,
      helpText: 'Your item must have been made before 1947.'
    }
  } else {
    return {
      pageTitle,
      helpText: 'Your item does not meet any of the ivory ban exemption criteria.'
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CANNOT_TRADE}`,
    handler: handlers.post
  }
]
