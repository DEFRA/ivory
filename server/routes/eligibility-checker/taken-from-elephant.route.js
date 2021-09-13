'use strict'

const { Paths, Views, Options, Analytics } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.TAKEN_FROM_ELEPHANT, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      await request.ga.event({
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: _getContext().pageTitle
      })

      return h
        .view(Views.TAKEN_FROM_ELEPHANT, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await request.ga.event({
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.takenFromElephant}`,
      label: _getContext().pageTitle
    })

    switch (payload.takenFromElephant) {
      case Options.YES:
        return h.redirect(Paths.CANNOT_TRADE)
      case Options.NO:
        return h.redirect(Paths.CAN_CONTINUE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was the replacement ivory taken from an elephant on or after 1 January 1975?',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.takenFromElephant)) {
    errors.push({
      name: 'takenFromElephant',
      text: 'You must tell us whether the replacement ivory was taken from an elephant on or after 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.TAKEN_FROM_ELEPHANT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.TAKEN_FROM_ELEPHANT}`,
    handler: handlers.post
  }
]
