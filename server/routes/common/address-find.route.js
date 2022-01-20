'use strict'

import AnalyticsService from '../../services/analytics.service.js'
import AddressService from '../../services/address.service.js'
import RedisService from '../../services/redis.service.js'
import { AddressType, BehalfOfBusinessOptions, BehalfOfNotBusinessOptions, CharacterLimits, Paths, RedisKeys, Views, Options, Analytics } from '../../utils/constants.js'
import { buildErrorSummary, Validators } from '../../utils/validation.js'
import { formatNumberWithCommas } from '../../utils/general.js'

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_FIND
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)
    const context = await _getContext(request, addressType)

    return h.view(Views.ADDRESS_FIND, {
      ...context
    })
  },

  post: async (request, h) => {
    const addressType = getAddressType(request)
    const context = await _getContext(request, addressType)
    const payload = request.payload
    const errors = _validateForm(payload)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.ADDRESS_FIND, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const searchResults = await AddressService.addressSearch(
      payload.nameOrNumber,
      payload.postcode
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${
        payload.nameOrNumber ? 'Property name or number' : 'Postcode only'
      } entered`,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      RedisKeys.ADDRESS_FIND_NAME_OR_NUMBER,
      payload.nameOrNumber
    )

    await RedisService.set(
      request,
      RedisKeys.ADDRESS_FIND_POSTCODE,
      payload.postcode.toUpperCase()
    )

    await RedisService.set(
      request,
      RedisKeys.ADDRESS_FIND_RESULTS,
      JSON.stringify(searchResults)
    )

    const resultSize = searchResults.length

    if (resultSize === 0 || resultSize > 50) {
      return h.redirect(
        addressType === AddressType.OWNER
          ? Paths.OWNER_ADDRESS_ENTER
          : Paths.APPLICANT_ADDRESS_ENTER
      )
    }

    if (resultSize === 1) {
      return h.redirect(
        addressType === AddressType.OWNER
          ? Paths.OWNER_ADDRESS_CONFIRM
          : Paths.APPLICANT_ADDRESS_CONFIRM
      )
    }

    return h.redirect(
      addressType === AddressType.OWNER
        ? Paths.OWNER_ADDRESS_CHOOSE
        : Paths.APPLICANT_ADDRESS_CHOOSE
    )
  }
}

const _getContext = async (request, addressType) => {
  let pageTitle

  if (addressType === AddressType.APPLICANT) {
    const workForABusiness =
      (await RedisService.get(request, RedisKeys.WORK_FOR_A_BUSINESS)) ===
      Options.YES

    pageTitle = workForABusiness
      ? "What's the address of the business you work for?"
      : 'What is your address?'
  } else {
    const sellingOnBehalfOf = await RedisService.get(
      request,
      RedisKeys.SELLING_ON_BEHALF_OF
    )

    const isBusiness = [
      BehalfOfBusinessOptions.ANOTHER_BUSINESS,
      BehalfOfNotBusinessOptions.A_BUSINESS
    ].includes(sellingOnBehalfOf)

    pageTitle = isBusiness
      ? 'What’s the address of the business that owns the item?'
      : 'What is the owner’s address?'
  }

  return {
    pageTitle
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.maxLength(payload.nameOrNumber, CharacterLimits.Input)) {
    errors.push({
      name: 'nameOrNumber',
      text: `Property name or number must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }

  if (Validators.empty(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text: 'Enter your postcode'
    })
  }

  if (!Validators.postcode(payload.postcode)) {
    errors.push({
      name: 'postcode',
      text: 'Enter a UK postcode in the correct format'
    })
  }

  return errors
}

const get = handlers.get;
const post = handlers.post;
export {
  get,
  post
}

export default {
  get,
  post
}
