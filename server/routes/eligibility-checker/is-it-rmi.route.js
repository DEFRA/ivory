'use strict'

const { ItemType, Paths, RedisKeys, Views, Options, Analytics } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.IS_IT_RMI, {
      ..._getContext()
    })
  },

  post: async (request, h) => {
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      await request.ga.event({
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: _getContext().pageTitle
      })

      return h
        .view(Views.IS_IT_RMI, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await request.ga.event({
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.isItRmi}`,
      label: _getContext().pageTitle
    })

    switch (payload.isItRmi) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.HIGH_VALUE
        )
        return h.redirect(Paths.IVORY_ADDED)
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Does your item have outstandingly high artistic, cultural or historical value?',
    helpText: 'The item must be a rare and socially significant example of its type.',
    callOutText: 'An item that only has sentimental value would not qualify, regardless of how important it is to you personally.',
    items: getStandardOptions(false)
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.isItRmi)) {
    errors.push({
      name: 'isItRmi',
      text: 'Tell us whether your item has outstandingly high artistic, cultural or historical value'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.IS_IT_RMI}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.IS_IT_RMI}`,
    handler: handlers.post
  }
]
