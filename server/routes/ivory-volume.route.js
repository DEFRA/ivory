'use strict'

const { Paths, RedisKeys, Views } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const musicalInstrument = false // temporary to deal with dynamic heading until it's parent page has been built

const handlers = {
  get: async (request, h) => {
    return h.view(Views.IVORY_VOLUME, {
      ..._getContext()
    })
  },
  post: (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.IVORY_VOLUME, {
          ..._getContext(),
<<<<<<< HEAD
<<<<<<< HEAD
          otherChecked: payload.ivoryVolume === 'Other',
=======
>>>>>>> 2501ea5 (Created page for viory volume)
=======
          otherChecked: payload.ivoryVolume === 'Other',
>>>>>>> 401e3ee (Tidied up)
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    RedisService.set(request, RedisKeys.IVORY_VOLUME, payload.ivoryVolume)

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = () => {
  if (musicalInstrument) {
    return {
      pageTitle: 'How do you know the item has less than 20% ivory by volume?'
    }
  } else {
    return {
      pageTitle: 'How do you know the item has less than 10% ivory by volume?'
    }
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.ivoryVolume)) {
    errors.push({
      name: 'ivoryVolume',
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 401e3ee (Tidied up)
      text: 'You must tell us how you know the item’s ivory volume'
    })
  }

  if (payload.ivoryVolume === 'Other' && Validators.empty(payload.otherDetail)) {
    errors.push({
      name: 'otherDetail',
      text: 'You must tell us how you know the item’s ivory volume'
<<<<<<< HEAD
=======
      text: 'Tell us what type of ivory you want to sell or hire out'
>>>>>>> 2501ea5 (Created page for viory volume)
=======
>>>>>>> 401e3ee (Tidied up)
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IVORY_VOLUME}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IVORY_VOLUME}`,
    handler: handlers.post
  }
]
