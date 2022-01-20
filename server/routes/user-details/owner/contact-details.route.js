'use strict'

import AnalyticsService from '../../../services/analytics.service.js';
import RedisService from '../../../services/redis.service.js';
import { BehalfOfBusinessOptions, BehalfOfNotBusinessOptions } from '../../../utils/constants.js';
import { CharacterLimits, Options, Paths, RedisKeys, Views, Analytics } from '../../../utils/constants.js';
import { formatNumberWithCommas } from '../../../utils/general.js';
import { buildErrorSummary, Validators } from '../../../utils/validation.js';
import { addPayloadToContext } from '../../../utils/general.js';

const handlers = {
  get: async (request, h) => {
    const context = await _getContext(request)

    return h.view(Views.CONTACT_DETAILS_OWNER, {
      ...context,
      pageTitle: context.pageTitle
    })
  },

  post: async (request, h) => {
    const context = await _getContext(request)
    const payload = request.payload
    const errors = _validateForm(payload, context.isBusiness)

    if (errors.length) {
      AnalyticsService.sendEvent(request, {
        category: Analytics.Category.ERROR,
        action: JSON.stringify(errors),
        label: context.pageTitle
      })

      return h
        .view(Views.CONTACT_DETAILS_OWNER, {
          ...context,
          ...buildErrorSummary(errors)
        })
        .code(400)
    }

    AnalyticsService.sendEvent(request, {
      category: Analytics.Category.MAIN_QUESTIONS,
      action: `${Analytics.Action.SELECTED} ${
        context.isBusiness ? context.businessName : context.fullName
      } ${payload.hasEmailAddress}${
        payload.hasEmailAddress === Options.YES
          ? ' - ' + payload.emailAddress
          : ''
      }`,
      label: context.pageTitle
    })

    if (payload.hasEmailAddress !== Options.YES) {
      delete payload.emailAddress
    }

    await RedisService.set(
      request,
      RedisKeys.OWNER_CONTACT_DETAILS,
      JSON.stringify(payload)
    )

    return h.redirect(Paths.OWNER_ADDRESS_FIND)
  }
}

const _getContext = async request => {
  let payload
  if (request.payload) {
    payload = request.payload
  } else {
    await RedisService.get(request, RedisKeys.OWNER_CONTACT_DETAILS)
  }

  const hasEmailAddress = payload ? payload.hasEmailAddress : null

  const contactDetails = await RedisService.get(
    request,
    RedisKeys.OWNER_CONTACT_DETAILS
  )

  const sellingOnBehalfOf = await RedisService.get(
    request,
    RedisKeys.SELLING_ON_BEHALF_OF
  )

  const isBusiness = [
    BehalfOfBusinessOptions.ANOTHER_BUSINESS,
    BehalfOfNotBusinessOptions.A_BUSINESS
  ].includes(sellingOnBehalfOf)

  const options = _getOptions(hasEmailAddress)
  const yesOption = options.shift()

  const context = {
    pageTitle: 'Owner’s contact details',
    items: options,
    yesOption,
    isBusiness,
    ...contactDetails
  }

  return addPayloadToContext(request, context)
}

const _getOptions = selectedOption => {
  return Object.values(Options)
    .slice(0, 2)
    .map(option => {
      return {
        value: option,
        text: option,
        checked: selectedOption === option
      }
    })
}

const _validateForm = (payload, isBusiness) => {
  const errors = []

  if (isBusiness) {
    _validateBusinessName(payload, errors)
  } else {
    _validateFullName(payload, errors)
  }

  _validateHasEmailAddress(payload, errors)

  if (payload.hasEmailAddress === Options.YES) {
    _validateEmailAddress(payload, errors)
  }

  return errors
}

const _validateBusinessName = (payload, errors) => {
  if (Validators.empty(payload.businessName)) {
    errors.push({
      name: 'businessName',
      text: 'Enter the owner’s business name'
    })
  } else if (
    Validators.maxLength(payload.businessName, CharacterLimits.Input)
  ) {
    errors.push({
      name: 'businessName',
      text: `Business name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }
}

const _validateFullName = (payload, errors) => {
  if (Validators.empty(payload.fullName)) {
    errors.push({
      name: 'fullName',
      text: 'Enter the owner’s full name'
    })
  } else if (Validators.maxLength(payload.fullName, CharacterLimits.Input)) {
    errors.push({
      name: 'fullName',
      text: `Full name must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }
}

const _validateHasEmailAddress = (payload, errors) => {
  if (Validators.empty(payload.hasEmailAddress)) {
    errors.push({
      name: 'hasEmailAddress',
      text: 'Enter the owner’s email address or select ‘no’'
    })
  }
}

const _validateEmailAddress = (payload, errors) => {
  if (Validators.empty(payload.emailAddress)) {
    errors.push({
      name: 'emailAddress',
      text: 'Enter the owner’s email address'
    })
  } else if (!Validators.email(payload.emailAddress)) {
    errors.push({
      name: 'emailAddress',
      text:
        'Enter an email address in the correct format, like name@example.com'
    })
  } else if (
    Validators.maxLength(payload.emailAddress, CharacterLimits.Input)
  ) {
    errors.push({
      name: 'emailAddress',
      text: `Email address must have fewer than ${formatNumberWithCommas(
        CharacterLimits.Input
      )} characters`
    })
  }
}

export default [
  {
    method: 'GET',
    path: `${Paths.OWNER_CONTACT_DETAILS}`,
    handler: handlers.get
  },
  {
    method: 'POST',
    path: `${Paths.OWNER_CONTACT_DETAILS}`,
    handler: handlers.post
  }
];
