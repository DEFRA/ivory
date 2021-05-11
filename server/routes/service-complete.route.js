'use strict'

const { Paths, Views } = require('../utils/constants')

const handlers = {
  get: async (request, h) => {
    //     const paymentId = await RedisService.get(request, RedisKeys.PAYMENT_ID)
    // const paymentId = await h.state.sessionId
    // console.log(paymentId)

    const paymentId2 = request.state.sessionId
    console.log(paymentId2)

    // console.log(server.state)
    // return h.view(Views.SERVICE_COMPLETE, {
    //   ..._getContext()
    // // })

    return h.view(Views.SERVICE_COMPLETE, {
      ..._getContext()
    })
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Service complete'
  }
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.SERVICE_COMPLETE}`,
    handler: handlers.get
  }
]
