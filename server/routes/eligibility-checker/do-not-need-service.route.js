'use strict'

const RedisService = require('../../services/redis.service')
const { Paths, RedisKeys, Views, Urls } = require('../../utils/constants')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.DO_NOT_NEED_SERVICE, {
      ...(await _getContext(request))
    })
  },

  post: (request, h) => h.redirect(Urls.GOV_UK_HOME)
}

const _getContext = async request => {
  const isMuseum =
    (await RedisService.get(request, RedisKeys.ARE_YOU_A_MUSEUM)) === 'true'

  const notContainingIvory =
    (await RedisService.get(request, RedisKeys.CONTAIN_ELEPHANT_IVORY)) ===
    'false'

  return {
    pageTitle: 'You don’t need to tell us about this item',
    isMuseum,
    notContainingIvory
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.DO_NOT_NEED_SERVICE}`,
    handler: handlers.post
  }
]
