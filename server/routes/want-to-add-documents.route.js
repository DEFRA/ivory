'use strict'

const { Paths, Views, Options } = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')
const { getStandardOptions } = require('../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.WANT_TO_ADD_DOCUMENTS, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.WANT_TO_ADD_DOCUMENTS, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    switch (payload.wantToAddDocuments) {
      case Options.YES:
        return h.redirect(Paths.UPLOAD_DOCUMENT)
      case Options.NO:
        return h.redirect(Paths.WHO_OWNS_ITEM)
    }
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
