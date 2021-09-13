'use strict'

const { Paths, Views, Options, Analytics } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.SELLING_TO_MUSEUM, {
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
        .view(Views.SELLING_TO_MUSEUM, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await request.ga.event({
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.sellingToMuseum}`,
      label: _getContext().pageTitle
    })

    switch (payload.sellingToMuseum) {
      case Options.YES:
        return h.redirect(Paths.ARE_YOU_A_MUSEUM)
      case Options.NO:
        return h.redirect(Paths.IS_IT_A_MUSICAL_INSTRUMENT)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.IS_IT_A_MUSICAL_INSTRUMENT)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Are you selling or hiring your item out to a museum?',
    helpText: 'The museum must be a member of the International Council of Museums, or accredited by one of the following:',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.sellingToMuseum)) {
    errors.push({
      name: 'sellingToMuseum',
      text: 'Tell us whether you are selling or hiring out your item to a museum'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SELLING_TO_MUSEUM}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.SELLING_TO_MUSEUM}`,
    handler: handlers.post
  }
]
