'use strict'

const RedisService = require('../services/redis.service')
const {
  Options,
  Paths,
  RedisKeys,
  SaleIntention,
  Views
} = require('../utils/constants')
const { buildErrorSummary, Validators } = require('../utils/validation')

const directions = {
  INTO: 'into',
  OUT_OF: 'out of'
}

const intentions = {
  SELL: 'sell it',
  HIRE: 'hire it out',
  SELL_OR_HIRE: 'sell or hire it out'
}

const handlers = {
  get: async (request, h) => {
    return h.view(Views.SALE_INTENTION, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.SALE_INTENTION, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.SALE_INTENTION,
      payload.saleIntention
    )

    return h.redirect(Paths.CHECK_YOUR_ANSWERS)
  }
}

const _getContext = async request => {
  const intentionForItem = await RedisService.get(
    request,
    RedisKeys.INTENTION_FOR_ITEM
  )
  const whereIsItem = await RedisService.get(request, RedisKeys.WHERE_IS_ITEM)

  const direction =
    whereIsItem === Options.NO ? directions.INTO : directions.OUT_OF

  let intention = ''
  if (intentionForItem === SaleIntention.SELL) {
    intention = intentions.SELL
  } else if (intentionForItem === SaleIntention.HIRE) {
    intention = intentions.HIRE
  } else {
    intention = intentions.SELL_OR_HIRE
  }

  return {
    pageTitle: `Will the item move ${direction} Great Britain when you ${intention}?`,
    items: [
      {
        value: Options.YES,
        text: Options.YES
      },
      {
        value: Options.NO,
        text: Options.NO
      },
      {
        value: "I'm not sure yet",
        text: "I'm not sure yet"
      }
    ]
  }
}

const _validateForm = payload => {
  const errors = []

  const direction = directions.INTO

  if (Validators.empty(payload.saleIntention)) {
    errors.push({
      name: 'saleIntention',
      text: `You must tell us if the item is moving ${direction} Great Britain when you sell or hire it out`
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SALE_INTENTION}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.SALE_INTENTION}`,
    handler: handlers.post
  }
]
