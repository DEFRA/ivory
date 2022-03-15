'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  AddressType,
  BehalfOfBusinessOptions,
  BehalfOfNotBusinessOptions,
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../../utils/constants')
const { formatNumberWithCommas } = require('../../utils/general')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const { convertToCommaSeparatedTitleCase } = require('../../utils/general')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_INTERNATIONAL
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const addressType = getAddressType(request)
    const context = await _getContext(request, addressType)

    return h.view(Views.ADDRESS_INTERNATIONAL, {
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
        .view(Views.ADDRESS_INTERNATIONAL, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    payload.internationalAddress = convertToCommaSeparatedTitleCase(
      payload.internationalAddress
    )

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: Analytics.Action.ENTERED,
      label: context.pageTitle
    })

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS
        : RedisKeys.APPLICANT_ADDRESS,
      payload.internationalAddress
    )

    await RedisService.set(
      request,
      addressType === AddressType.OWNER
        ? RedisKeys.OWNER_ADDRESS_INTERNATIONAL
        : RedisKeys.APPLICANT_ADDRESS_INTERNATIONAL,
      true
    )

    if (
      addressType === AddressType.APPLICANT &&
      ownedByApplicant === Options.YES
    ) {
      await RedisService.set(
        request,
        RedisKeys.OWNER_ADDRESS,
        payload.internationalAddress
      )

      await RedisService.set(
        request,
        RedisKeys.OWNER_ADDRESS_INTERNATIONAL,
        true
      )
    }

    let route
    if (addressType === AddressType.APPLICANT) {
      route = Paths.INTENTION_FOR_ITEM
    } else {
      route = Paths.APPLICANT_CONTACT_DETAILS
    }

    return h.redirect(route)
  }
}

const _getContext = async (request, addressType) => {
  let pageTitle

  if (addressType === AddressType.APPLICANT) {
    const workForABusiness = await RedisService.get(
      request,
      RedisKeys.WORK_FOR_A_BUSINESS
    )

    pageTitle = workForABusiness
      ? 'Enter the address of the business'
      : 'Enter your address'
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
      ? 'Enter the address of the business'
      : 'Enter the owner’s address'
  }

  return {
    pageTitle
  }
}

const _validateForm = payload => {
  const errors = []

  if (Validators.empty(payload.internationalAddress)) {
    errors.push({
      name: 'internationalAddress',
      text: 'Enter the address'
    })
  }

  if (
    Validators.maxLength(payload.internationalAddress, CharacterLimits.Textarea)
  ) {
    errors.push({
      name: 'internationalAddress',
      text: `Address must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Textarea
      )} characters`
    })
  }

  return errors
}

module.exports = {
  get: handlers.get,
  post: handlers.post
}
