'use strict'

import AnalyticsService from '../../services/analytics.service.js'
import RedisService from '../../services/redis.service.js'
import RedisHelper from '../../services/redis-helper.service.js'
import { AddressType, Analytics, Paths, RedisKeys, Views } from '../../utils/constants.js'
import { buildErrorSummary, Validators } from '../../utils/validation.js'

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_CHOOSE
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.ADDRESS_CHOOSE, {
      ...context
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: `Address choose - ${addressType}`
      })

      return h
        .view(Views.ADDRESS_CHOOSE, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} address`,
      label: `Address choose - ${addressType}`
    })

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      payload.address
    )

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS_INTERNATIONAL
        : RedisKeys.APPLICANT_ADDRESS_INTERNATIONAL,
      false
    )

    if (addressType === AddressType.APPLICANT && context.isOwnedByApplicant) {
      await RedisService.set(request, RedisKeys.OWNER_ADDRESS, payload.address)

      await RedisService.set(
        request,
        RedisKeys.OWNER_ADDRESS_INTERNATIONAL,
        false
      )
    }

    let route
    if (addressType === AddressType.OWNER) {
      route = context.isOwnedByApplicant
        ? Paths.INTENTION_FOR_ITEM
        : Paths.APPLICANT_CONTACT_DETAILS
    } else {
      route = Paths.INTENTION_FOR_ITEM
    }

    return h.redirect(route)
  }
}

const _getContext = async request => {
  const context = {
    pageTitle: 'Choose address'
  }

  context.isOwnedByApplicant = await RedisHelper.isOwnedByApplicant(request)

  const addresses = await RedisService.get(
    request,
    RedisKeys.ADDRESS_FIND_RESULTS
  )

  const items = addresses.map(item => {
    return {
      value: item.Address.AddressLine,
      text: item.Address.AddressLine
    }
  })

  context.addresses = items

  await _addBuildingNameOrNumberAndPostcodeToContext(request, context)

  return context
}

const _addBuildingNameOrNumberAndPostcodeToContext = async (
  request,
  context
) => {
  const nameOrNumber = await RedisService.get(
    request,
    RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER
  )

  const postcode = await RedisService.get(
    request,
    RedisKeys.ADDRESS_FIND_POSTCODE
  )

  context.showHelpText = nameOrNumber && postcode
  context.nameOrNumber = nameOrNumber
  context.postcode = postcode
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.address)) {
    errors.push({
      name: 'address',
      text: 'You must choose an address'
    })
  }

  return errors
}

const get = handlers.get
const post = handlers.post
export {
  get,
  post
}

export default {
  get,
  post
}
