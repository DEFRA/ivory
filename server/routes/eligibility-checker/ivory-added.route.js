'use strict'

const { Paths, Views, Options, Analytics } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IVORY_ADDED, {
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
        .view(Views.IVORY_ADDED, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await request.ga.event({
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.ivoryAdded}`,
      label: _getContext().pageTitle
    })

    switch (payload.ivoryAdded) {
      case Options.YES:
        return h.redirect(Paths.TAKEN_FROM_ELEPHANT)
      case Options.NO:
        return h.redirect(Paths.CAN_CONTINUE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle:
      'Has any ivory been added since 1 January 1975 to restore the item to its original state?',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.ivoryAdded)) {
    errors.push({
      name: 'ivoryAdded',
      text:
        'You must tell us if any ivory has been added to the item since 1 January 1975'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_ADDED}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_ADDED}`,
    handler: handlers.post
  }
]
