'use strict'

const AnalyticsService = require('../services/analytics.service')

const { Paths, Views, Options, Analytics } = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')
const { getStandardOptions } = require('../utils/general')

const handlers = {
  get: (request, h) => {
    const context = _getContext()

    return h.view(Views.WANT_TO_ADD_DOCUMENTS, {
      ...context
    })
  },

  post: async (request, h) => {
    const context = _getContext()
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: _getContext().pageTitle
      })

      return h
        .view(Views.WANT_TO_ADD_DOCUMENTS, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.wantToAddDocuments}`,
      label: context.pageTitle
    })

    return payload.wantToAddDocuments === Options.YES
      ? h.redirect(Paths.UPLOAD_DOCUMENT)
      : h.redirect(Paths.WHO_OWNS_ITEM)
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Do you want to add any documents to support your application?',
    helpText:
      'You must be acting on behalf of a museum that is a member of the International Council of Museums, or accredited by one of the following:',
    items: getStandardOptions(false)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.wantToAddDocuments)) {
    errors.push({
      name: 'wantToAddDocuments',
      text:
        'You must tell us if you want to add any documents to support your application'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WANT_TO_ADD_DOCUMENTS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WANT_TO_ADD_DOCUMENTS}`,
    handler: handlers.post
  }
]
