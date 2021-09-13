'use strict'

const { ItemType, Paths, RedisKeys, Views, Options, Analytics } = require('../../utils/constants')
const RedisService = require('../../services/redis.service')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { getStandardOptions } = require('../../utils/general')

const handlers = {
  get: (request, h) => {
    return h.view(Views.MADE_BEFORE_1947, {
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
        .view(Views.MADE_BEFORE_1947, {
          ..._getContext(),
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    await request.ga.event({
      category: Analytics.Category.ELIGIBILITY_CHECKER,
      action: `${Analytics.Action.SELECTED} ${payload.madeBefore1947}`,
      label: _getContext().pageTitle
    })

    switch (payload.madeBefore1947) {
      case Options.YES:
        await RedisService.set(
          request,
          RedisKeys.WHAT_TYPE_OF_ITEM_IS_IT,
          ItemType.TEN_PERCENT
        )
        return h.redirect(Paths.IVORY_ADDED)
      case Options.NO:
        return h.redirect(Paths.CANNOT_TRADE)
      case Options.I_DONT_KNOW:
        return h.redirect(Paths.CANNOT_CONTINUE)
    }
  }
}

const _getContext = () => {
  return {
    pageTitle: 'Was your item made before 3 March 1947?',
    helpText: 'The following might help you decide:',
    items: getStandardOptions()
  }
}

const _validateForm = payload => {
  const errors = []
  if (Validators.empty(payload.madeBefore1947)) {
    errors.push({
      name: 'madeBefore1947',
      text: 'Tell us whether your item was made before 3 March 1947'
    })
  }
  return errors
}

module.exports = [
  {
    method: 'GET',
    path: `${Paths.MADE_BEFORE_1947}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.MADE_BEFORE_1947}`,
    handler: handlers.post
  }
]
