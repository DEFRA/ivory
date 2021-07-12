'use strict'

const { Paths, Views, RedisKeys } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const NOT_APPLICABLE = 'N/A'

const handlers = {
  get: async (request, h) => {
    return h.view(Views.CHECK_YOUR_ANSWERS, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      return h
        .view(Views.CHECK_YOUR_ANSWERS, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    return h.redirect(Paths.MAKE_PAYMENT)
  }
}

const _getContext = async request => {
  const itemDescription =
    JSON.parse(await RedisService.get(request, RedisKeys.DESCRIBE_THE_ITEM)) ||
    {}

  return {
    pageTitle: 'Check your answers (incomplete)',
    whatTypeOfItemIsIt: await RedisService.get(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
    ),

    whatIsItem: itemDescription.whatIsItem,
    whereIsIvory: itemDescription.whereIsIvory,
    uniqueFeatures: itemDescription.uniqueFeatures || NOT_APPLICABLE,
    whereMade: itemDescription.whereMade || NOT_APPLICABLE,
    whenMade: itemDescription.whenMade || NOT_APPLICABLE,

    whyRmi: await RedisService.get(request, RedisKeys.WHY_IS_ITEM_RMI),
    ivoryVolume: await RedisService.get(request, RedisKeys.IVORY_VOLUME),
    ivoryAge: await RedisService.get(request, RedisKeys.IVORY_AGE),
    ivoryIntegral: await RedisService.get(request, RedisKeys.IVORY_INTEGRAL),

    ownerDetails: `${await RedisService.get(
      request,
      RedisKeys.OWNER_NAME
    )} ${await RedisService.get(request, RedisKeys.OWNER_EMAIL_ADDRESS)}`,
    ownerAddress: `${await RedisService.get(request, RedisKeys.OWNER_ADDRESS)}`,

    applicantDetails: `${await RedisService.get(
      request,
      RedisKeys.APPLICANT_NAME
    )} ${await RedisService.get(request, RedisKeys.APPLICANT_EMAIL_ADDRESS)}`,
    applicantAddress: `${await RedisService.get(
      request,
      RedisKeys.APPLICANT_ADDRESS
    )}`,

    intentionForItem: `${await RedisService.get(
      request,
      RedisKeys.INTENTION_FOR_ITEM
    )}`,
    whereIsItem: `${await RedisService.get(request, RedisKeys.WHERE_IS_ITEM)}`,
    saleIntention: `${await RedisService.get(
      request,
      RedisKeys.SALE_INTENTION
    )}`,

    cost:
      parseInt(await RedisService.get(request, RedisKeys.PAYMENT_AMOUNT)) / 100
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.agree)) {
    errors.push({
      name: 'agree',
      text: 'You must agree to the declaration'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.CHECK_YOUR_ANSWERS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.CHECK_YOUR_ANSWERS}`,
    handler: handlers.post
  }
]
