'use strict'

const RedisService = require('../services/redis.service')
const { ItemType, Paths, RedisKeys, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.CAN_CONTINUE, {
      ...(await _getContext(request))
    })
  },

  post: (request, h) => {
    return h.redirect(Paths.LEGAL_REPONSIBILITY)
  }
}

const _getItemType = async request => {
  return await RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
}

const _getContext = async request => {
  if ((await _getItemType(request)) === ItemType.HIGH_VALUE) {
    return {
      pageTitle: 'You must now apply for an exemption certificate',
      additionalSteps: [
        'pay a non-refundable administration fee of £250',
        'wait 30 days for your application to be approved by an expert'
      ],
      finalParagraph: 'If your application is successful, we will send you an exemption certificate so you can sell or hire out your item.'
    }
  } else {
    return {
      pageTitle: 'You must now make a self-assessment to sell or hire out your item',
      additionalSteps: [
        'pay an administration fee of £20'
      ],
      finalParagraph: 'As soon as you successfully make the payment, you’ll be able to sell the item or hire it out.'
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CAN_CONTINUE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CAN_CONTINUE}`,
    handler: handlers.post
  }
]
