'use strict'

const { Paths, Views, Urls, Analytics } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    const referringUrl = request.headers.referer
    await request.ga.event({
      category: Analytics.Category.SERVICE_COMPLETE,
      action: Analytics.Action.DROPOUT,
      label: _getContext(referringUrl).pageTitle
    })

    return h.view(Views.CANNOT_TRADE, {
      ..._getContext(referringUrl)
    })
  },

  post: async (request, h) => {
    await request.ga.event({
      category: Analytics.Category.SERVICE_COMPLETE,
      action: `${Analytics.Action.SELECTED} Finish and redirect button`,
      label: 'Cannot Trade'
    })

    return h.redirect(Urls.GOV_UK_HOME)
  }
}

const _getContext = referringUrl => {
  const pageTitle = 'You are not allowed to sell or hire out your item'

  if (referringUrl.includes(Paths.TAKEN_FROM_ELEPHANT)) {
    return {
      pageTitle,
      helpText:
        'Any replacement ivory in your item must have been taken from an elephant before 1 January 1975.'
    }
  } else if (referringUrl.includes(Paths.MADE_BEFORE_1947)) {
    return {
      pageTitle,
      helpText: 'Your item must have been made before 3 March 1947.'
    }
  } else {
    return {
      pageTitle,
      helpText:
        'Your item does not meet any of the ivory ban exemption criteria.'
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
