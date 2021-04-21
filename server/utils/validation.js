'use strict'

const VALIDATION_SUMMARY_HEADING = 'There is a problem'

/**
 * Performs validation, checks an email address using a regular expresssion to determine whether or not it is valid
 * i.e. in a correct email format.
 * @param {*} value The email address to validate.
 * @returns True if the email address is valid, otherwise false.
 */
const email = value => {
  return value.match(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  )
}

/**
 * Performs validation, checks whether or not the incoming value is empty.
 * @param {*} value The value to be validated.
 * @returns True if the value is empty, otherwise false.
 */
const empty = value => {
  return !value || value.toString().trim().length === 0
}

const Validators = {
  email,
  empty
}

/**
 * Creates an error summary object for use in form-layout pages that
 * include field validation
 * @param {*} errors An array of errors
 * @returns An error summary object
 */
const buildErrorSummary = errors => {
  return {
    errorSummary: {
      titleText: VALIDATION_SUMMARY_HEADING,
      errorList: _getErrorList(errors)
    },
    fieldErrors: _getFieldErrors(errors)
  }
}

const _getErrorList = errors => {
  let errorList = []
  if (errors && Array.isArray(errors) && errors.length) {
    errorList = errors.map(error => {
      return {
        text: error.text,
        href: `#${error.name}`
      }
    })
  }

  return errorList
}

const _getFieldErrors = errors => {
  const fieldErrors = {}
  for (const { name, text } of errors) {
    fieldErrors[name] = { text }
  }
  return fieldErrors
}

module.exports = {
  buildErrorSummary,
  Validators
}
