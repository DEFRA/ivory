'use strict'

const AnalyticsService = require('../../services/analytics.service')
const RedisService = require('../../services/redis.service')

const {
  AddressType,
  CharacterLimits,
  Options,
  Paths,
  RedisKeys,
  Views,
  Analytics
} = require('../../utils/constants')
const { formatNumberWithCommas } = require('../../utils/general')
const { buildErrorSummary, Validators } = require('../../utils/validation')

const {
  addPayloadToContext,
  convertToCommaSeparatedTitleCase
} = require('../../utils/general')

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

    if (ownedByApplicant === Options.YES) {
      await RedisService.set(
        request,
        RedisKeys.APPLICANT_ADDRESS,
        payload.internationalAddress
      )
    }

    let route
    if (addressType === AddressType.OWNER) {
      route =
        ownedByApplicant === Options.YES
          ? Paths.INTENTION_FOR_ITEM
          : Paths.APPLICANT_CONTACT_DETAILS
    } else {
      route = Paths.INTENTION_FOR_ITEM
    }

    return h.redirect(route)
  }
}

const _getContext = async (request, addressType) => {
  let context

  const ownedByApplicant = await RedisService.get(
    request,
    RedisKeys.OWNED_BY_APPLICANT
  )

  if (addressType === AddressType.OWNER) {
    context = _getContextForOwnerAddressType(ownedByApplicant)
  } else {
    context = _getContextForApplicantAddressType()
  }

  addPayloadToContext(request, context)

  return context
}

// TODO
// 'Enter the address of the business'

const _getContextForOwnerAddressType = ownedByApplicant => {
  let context
  if (ownedByApplicant === Options.YES) {
    context = {
      pageTitle: 'Enter your address'
    }
  } else {
    context = {
      pageTitle: "Enter the owner's address"
    }
  }
  return context
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'Enter your address'
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
