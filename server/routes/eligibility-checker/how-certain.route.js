'use strict'

const { Paths, Views } = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const handlers = {
  get: (request, h) => {
    return h.view(Views.HOW_CERTAIN)
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.HOW_CERTAIN, {
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    if (payload.howCertain === 'Completely') {
      return h.redirect(Paths.WHAT_TYPE_OF_ITEM_IS_IT)
    } else {
      return h.redirect(Paths.CONTAIN_ELEPHANT_IVORY)
    }
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.howCertain)) {
    errors.push({
      name: 'howCertain',
      text: 'Tell us how certain you are that your item is exempt from the ivory ban'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.HOW_CERTAIN}`,
    handler: handlers.post
  }
]
