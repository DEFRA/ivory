'use strict'

const { ItemType, Paths, RedisKeys, Views, Analytics } = require('../utils/constants')
const RedisService = require('../services/redis.service')
const { buildErrorSummary, Validators } = require('../utils/validation')

const handlers = {
  get: async (request, h) => {
    return h.view(Views.WHAT_TYPE_OF_ITEM_IS_IT, {
      ...(await _getContext(request))
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      await request.ga.event({
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: (await _getContext(request)).pageTitle
      })

      return h
        .view(Views.WHAT_TYPE_OF_ITEM_IS_IT, {
          ...(await _getContext(request)),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await RedisService.set(
      request,
      RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
      payload.whatTypeOfItemIsIt
    )

    await request.ga.event({
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${payload.whatTypeOfItemIsIt}`,
      label: (await _getContext(request)).pageTitle
    })

    return h.redirect(Paths.CAN_CONTINUE)
  }
}

const _getContext = async request => {
  return {
    pageTitle: 'What is your ivory item?',
    items: await _getOptions(request),
    linkUrl: Paths.CONTAIN_ELEPHANT_IVORY
  }
}

const _getOptions = async request => {
  const whatTypeOfItemIsIt = await RedisService.get(
    request,
    RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT
  )

  const options = Object.values(ItemType).map(itemType => {
    return {
      value: itemType,
      text: itemType,
      checked: whatTypeOfItemIsIt === itemType
    }
  })

  _addHints(options)

  return options
}

const _addHints = async options => {
  const hints = [
    '',
    'The ivory must be integral to the item.',
    '',
    'This cannot be raw (‘unworked’) ivory. You don’t need to tell us if you are a qualifying museum that’s selling or hiring out an ivory item to another qualifying museum.',
    ''
  ]

  for (let index = 0; index < options.length; index++) {
    options[index].hint = {
      text: hints[index]
    }
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.whatTypeOfItemIsIt)) {
    errors.push({
      name: 'whatTypeOfItemIsIt',
      text: 'Tell us what type of ivory you want to sell or hire out'
    })
  }

  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.WHAT_TYPE_OF_ITEM_IS_IT}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.WHAT_TYPE_OF_ITEM_IS_IT}`,
    handler: handlers.post
  }
]
