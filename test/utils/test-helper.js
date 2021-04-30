'use strict'

const jsdom = require('jsdom')
const { JSDOM } = jsdom

const elementIds = {
  backLink: 'back-link'
}

const DEFAULT_VALIDATION_SUMMARY_HEADING = 'There is a problem'

module.exports = class TestHelper {
  /**
   * Retreives the HTML document contained within an HTTP response object
   * @param response - The HTTP response object containing the document
   * @returns A JSDOM document object containing HTML content
   */
  static async getDocument (response) {
    return response && response.payload
      ? new JSDOM(response.payload).window.document
      : null
  }

  /**
   * Submits a HTTP GET request to the test server, checks the response code and returns a JSDOM object containing the page content.
   * @param server - The test server to send the HTTP GET request to
   * @param options - The options to be sent to the request (e.g. URL, headers, payload)
   * @param expectedResponseCode - The expected HTTP response code)
   * @returns  A JSDOM document object containing HTML content
   */
  static async submitGetRequest (server, options, expectedResponseCode = 200) {
    const response = await server.inject(options)
    expect(response.statusCode).toBe(expectedResponseCode)
    return TestHelper.getDocument(response)
  }

  /**
   * Submits a HTTP GET request to the test server, checks the response code and returns the HTTP response.
   * @param server - The test server to send the HTTP POST request to
   * @param options - The options to be sent to the request (e.g. URL, headers, payload)
   * @param expectedResponseCode - The expected HTTP response code).
   *  302 (redirect) would be expected after a successful GET.
   *  400 would be expected if a vaiidation error occurs.
   * @returns  the HTTP response
   */
  static async getResponse (server, options, expectedResponseCode = 200) {
    const response = await server.inject(options)

    expect(response.statusCode).toBe(expectedResponseCode)
    return response
  }

  /**
   * Submits a HTTP POST request to the test server, checks the response code and returns the HTTP response.
   * @param server - The test server to send the HTTP POST request to
   * @param options - The options to be sent to the request (e.g. URL, headers, payload)
   * @param expectedResponseCode - The expected HTTP response code).
   *  302 (redirect) would be expected after a successful POST.
   *  400 would be expected if a vaiidation error occurs.
   * @returns  the HTTP response
   */
  static async submitPostRequest (server, options, expectedResponseCode = 302) {
    const response = await server.inject(options)
    expect(response.statusCode).toBe(expectedResponseCode)
    return response
  }

  /**
   * Checks the document to ensure that it contains the correct BETA banner
   * @param document - The HTML document
   */
  static checkBetaBanner (document) {
    const element = document.querySelector('.govuk-phase-banner__content__tag')
    expect(element).toBeTruthy()
    expect(TestHelper.getTextContent(element).toLowerCase()).toEqual('beta')
  }

  /**
   * Checks the document to ensure that it contains the correct back link (if expected)
   * @param document - The HTML document
   * @param expectToExist - Flag to indicate whether or not the back link is expected
   */
  static checkBackLink (document, expectToExist = true) {
    const element = document.querySelector(`#${elementIds.backLink}`)
    if (expectToExist) {
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual('Back')
    } else {
      expect(element).toBeFalsy()
    }
  }

  static checkElementsExist (document, elementIds) {
    if (elementIds && Array.isArray(elementIds) && elementIds.length) {
      for (let i = 0; i < elementIds.length; i++) {
        try {
          expect(document.querySelector(`#${elementIds[i]}`)).toBeTruthy()
        } catch (e) {
          throw new Error(`Element with ID [${elementIds[i]}] does not exist`)
        }
      }
    }
  }

  static checkElementsDoNotExist (document, elementIds) {
    if (elementIds && Array.isArray(elementIds) && elementIds.length) {
      for (let i = 0; i < elementIds.length; i++) {
        try {
          expect(document.querySelector(`#${elementIds[i]}`)).toBeFalsy()
        } catch (e) {
          throw new Error(
            `Element with ID [${elementIds[i]}] exists when it shoudn't`
          )
        }
      }
    }
  }

  static checkRadioOption (
    document,
    elementName,
    expectedValue,
    expectedLabel,
    expectedCheckedValue = false
  ) {
    const element = document.querySelector(`#${elementName}`)
    expect(element).toBeTruthy()
    expect(element.value).toEqual(expectedValue)
    expectedCheckedValue
      ? expect(element.checked).toBeTruthy()
      : expect(element.checked).toBeFalsy()

    const elementLabel = document.querySelector(`label[for="${elementName}"]`)
    expect(elementLabel).toBeTruthy()
    expect(TestHelper.getTextContent(elementLabel)).toEqual(expectedLabel)
  }

  static checkFormField (
    document,
    fieldName,
    expectedLabel,
    expectedHint,
    expectedValue
  ) {
    let element = document.querySelector(`#${fieldName}`)
    expect(element).toBeTruthy()

    if (expectedValue === '') {
      expect(TestHelper.getFormFieldValue(element)).toBeNull()
    } else if (expectedValue) {
      expect(TestHelper.getFormFieldValue(element)).toEqual(expectedValue)
    }

    element = document.querySelector(`[for="${fieldName}"]`)
    expect(element).toBeTruthy()
    expect(TestHelper.getTextContent(element)).toEqual(expectedLabel)

    if (expectedHint) {
      element = document.querySelector(`#${fieldName}-hint`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(expectedHint)
    }
  }

  static async checkFormFieldValidation (
    postOptions,
    server,
    fieldName,
    expectedValidationMessage
  ) {
    const response = await TestHelper.submitPostRequest(
      server,
      postOptions,
      400
    )
    return TestHelper.checkValidationError(
      response,
      fieldName,
      `${fieldName}-error`,
      expectedValidationMessage
    )
  }

  /**
   * Submits a HTTP POST request to the test server, checks the response code and returns the HTTP response.
   * @param response - The HTTP response object containing the document
   * @param fieldAnchor - The page anchor used to set the focus in the HREF
   * @param fieldErrorId - The ID of the HTML element containing the field-level error message
   * @param summaryHeading - The expected heading of the error summary panel
   * @param expectedValidationMessage - The expected summary panel validation error message
   * @param expectedFieldValidationMessage - The expected field alidation error message
   * @param isUsingHrefs - Flag to indicate if summary panel field errors use hyperlnks to the error field
   */
  static async checkValidationError (
    response,
    fieldAnchor,
    fieldErrorId,
    expectedValidationMessage,
    expectedFieldValidationMessage = expectedValidationMessage,
    summaryHeading = DEFAULT_VALIDATION_SUMMARY_HEADING,
    isUsingHrefs = true
  ) {
    const document = await TestHelper.getDocument(response)

    // Error summary heading
    let element = document.querySelector('#error-summary-title')
    expect(TestHelper.getTextContent(element)).toEqual(summaryHeading)

    // Error summary list item
    element = document.querySelector(
      `.govuk-error-summary__list > li ${isUsingHrefs ? '> a' : ''}`
    )

    expect(TestHelper.getTextContent(element)).toEqual(
      expectedValidationMessage
    )

    if (isUsingHrefs) {
      expect(element.href).toContain(`#${fieldAnchor}`)
    }

    // Field error
    element = document.querySelector(`#${fieldErrorId}`)
    expect(TestHelper.getTextContent(element)).toContain(
      expectedFieldValidationMessage
    )
  }

  /**
   * Gets the text contained within an HTML element
   * @param element - The HTML element
   * @returns the text contained within the HTML element
   */
  static getTextContent (element) {
    return element && element.textContent ? element.textContent.trim() : null
  }

  static getFormFieldValue (element) {
    return element && element.value ? element.value.trim() : null
  }
}
