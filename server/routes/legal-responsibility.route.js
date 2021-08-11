'use strict'

const RedisService = require('../services/redis.service')
const { ItemType, Paths, RedisKeys, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.LEGAL_REPONSIBILITY, {
      ...(await _getContext(request))
    })
  },

  post: (request, h) => {
    return h.redirect(Paths.UPLOAD_PHOTO)
  }
}

const _getItemType = async request => {
  return await RedisService.get(request, RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT)
}

const _getContext = async request => {
  if ((await _getItemType(request)) === ItemType.HIGH_VALUE) {
    return {
      pageTitle:
        'The person doing this application is legally responsible for the information in it',
      helpTextParas: [
        'If you’re acting on behalf of someone else, you must be certain that the information is accurate.',
        'Stop at any point if you’re unsure about the right answer.'
      ],
      callOutText:
        'If we later find out that the information you’ve given is not accurate, you could be fined or prosecuted.'
    }
  } else {
    return {
      pageTitle:
        'The item’s owner is legally responsible for the information you’re about to give',
      helpTextParas: [
        'Stop at any point if you’re unsure about the right answer.',
        'This is a self-assessment, so the owner is responsible for ensuring the item is exempt.'
      ],
      callOutText:
        'If we later find out that the item is not exempt, the item’s owner could be fined or prosecuted.'
    }
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.LEGAL_REPONSIBILITY}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.LEGAL_REPONSIBILITY}`,
    handler: handlers.post
  }
]
