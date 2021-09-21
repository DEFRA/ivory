'use strict'

const AnalyticsService = require('../../services/analytics.service')
const AddressService = require('../../services/address.service')
const RedisService = require('../../services/redis.service')

const {
  AddressType,
  CharacterLimits,
  Paths,
  RedisKeys,
  Views,
  Options,
  Analytics
} = require('../../utils/constants')
const { buildErrorSummary, Validators } = require('../../utils/validation')
const { addPayloadToContext } = require('../../utils/general')
const { formatNumberWithCommas } = require('../../utils/general')

const getAddressType = request =>
  request.route.path === Paths.OWNER_ADDRESS_FIND
    ? AddressType.OWNER
    : AddressType.APPLICANT

const handlers = {
  get: async (request, h) => {
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    return h.view(Views.ADDRESS_FIND, {
      ...(await _getContext(request, getAddressType(request), ownedByApplicant))
    })
  },

  post: async (request, h) => {
    const ownedByApplicant = await RedisService.get(
      request,
      RedisKeys.OWNED_BY_APPLICANT
    )

    const addressType = getAddressType(request)
    const context = await _getContext(request, addressType, ownedByApplicant)
    const payload = request.payload
    const errors = _validateForm(payload, addressType, ownedByApplicant)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.ADDRESS_FIND, {
          ...(await _getContext(request, addressType, ownedByApplicant)),
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
      label: (await _getContext(request, addressType, ownedByApplicant))
        .pageTitle
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

    if (resultSize > 1) {
      return h.redirect(
        addressType === AddressType.OWNER
          ? Paths.OWNER_ADDRESS_CHOOSE
          : Paths.APPLICANT_ADDRESS_CHOOSE
      )
    }
  }
}

const _getContext = async (request, addressType, ownedByApplicant) => {
  let context

  if (addressType === AddressType.OWNER) {
    context = _getContextForOwnerAddressType(ownedByApplicant)
  } else {
    context = _getContextForApplicantAddressType()
  }

  addPayloadToContext(request, context)

  return context
}

const _getContextForOwnerAddressType = ownedByApplicant => {
  let context
  if (ownedByApplicant === Options.YES) {
    context = {
      pageTitle: 'What is your address?',
      helpText:
        'If your business is the legal owner of the item, give your business address.'
    }
  } else {
    context = {
      pageTitle: 'What is the owner’s address?',
      helpText:
        'If the legal owner of the item is a business, give the business address.'
    }
  }
  return context
}

const _getContextForApplicantAddressType = () => {
  return {
    pageTitle: 'What is your address?',
    helpText:
      'If your business is helping someone else sell their item, give your business address.'
  }
}

const _validateForm = (payload, addressType, ownedByApplicant) => {
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
    let errorMessage
    if (addressType === AddressType.OWNER) {
      errorMessage =
        ownedByApplicant === Options.YES
          ? 'Enter your postcode'
          : "Enter the owner's postcode"
    } else {
      errorMessage = 'Enter your postcode'
    }
    errors.push({
      name: 'postcode',
      text: errorMessage
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

module.exports = {
  get: handlers.get,
  post: handlers.post
}
