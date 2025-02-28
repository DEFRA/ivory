'use strict'

const https = require('https')
const fetch = require('node-fetch')
const { readFileSync } = require('fs')

const { convertToCommaSeparatedTitleCase } = require('../utils/general')

const config = require('../utils/config')

const ActiveDirectoryAuthService = require('../services/active-directory-auth.service')

const PAGE_SIZE = 100
const POSTCODE_SEARCH_ENDPOINT = '/ws/rest/DEFRA/v1/address/postcodes'
const POSTCODE_SEARCH_ENDPOINT_V2 = '/api/address-lookup/v2.1/addresses'

const SUCCESS_STATUS = 200

const addressV2ToV1FieldMap = {
  addressLine: 'AddressLine',
  buildingNumber: 'BuildingNumber',
  buildingName: 'BuildingName',
  subBuildingName: 'SubBuildingName',
  street: 'Street',
  locality: 'Locality',
  town: 'Town',
  cermonialCounty: 'County',
  postcode: 'Postcode',
  country: 'Country',
  xCoordinate: 'XCoordinate',
  yCoordinate: 'YCoordinate',
  uprn: 'UPRN',
  match: 'Match',
  matchDescription: 'MatchDescription',
  language: 'Language'
}
const addressV2ToV1Mapper = (address) => ({
  Address: Object.fromEntries(
    Object.entries(address)
      .filter(([key]) => Object.keys(addressV2ToV1FieldMap).includes(key))
      .map(([key, value]) => [addressV2ToV1FieldMap[key], value]))
})

module.exports = class AddressService {
  static async addressSearch (nameOrNumber, postcode, pageSize = PAGE_SIZE) {
    if (!config.addressLookupEnabled) {
      return []
    }

    const queryFunctionToUse = config.addressLookupUseV2 ? AddressService._queryAddressEndpointV2 : AddressService._queryAddressEndpoint

    let pageNumber = 0

    const json = await queryFunctionToUse(
      postcode,
      pageNumber,
      pageSize
    )

    let searchResults = json?.results ?? []

    if (json?.header?.totalresults) {
      while (searchResults.length < parseInt(json.header.totalresults)) {
        pageNumber++
        const additionalJson = await queryFunctionToUse(
          postcode,
          pageNumber,
          pageSize
        )
        const additionalSearchResults = additionalJson?.results ?? []

        searchResults = searchResults.concat(additionalSearchResults)
      }
    }

    if (config.addressLookupUseV2) {
      searchResults = searchResults.map(addressV2ToV1Mapper)
    }

    const filteredResults = _filterResults(searchResults, nameOrNumber)

    _convertResultsToTitleCase(filteredResults)

    return filteredResults
  }

  static async _queryAddressEndpoint (postcode, pageNumber, pageSize) {
    const authOptions = {
      passphrase: config.addressLookupPassphrase,
      pfx: _getCertificate(),
      keepAlive: false
    }
    const tlsConfiguredAgent = new https.Agent(authOptions)
    const fetchOptions = {
      agent: tlsConfiguredAgent
    }
    const url = `${config.addressLookupUrl}${POSTCODE_SEARCH_ENDPOINT}`

    return AddressService._fetchFromURL(url, fetchOptions, postcode, pageNumber, pageSize)
  }

  static async _queryAddressEndpointV2 (postcode, pageNumber, pageSize) {
    const token = await ActiveDirectoryAuthService.getTokenForAddressLookup()
    const fetchOptions = {
      method: 'GET',
      headers: { AUTHORIZATION: `Bearer ${token}` }
    }
    const url = `${config.addressLookupUrlV2}${POSTCODE_SEARCH_ENDPOINT_V2}`

    return AddressService._fetchFromURL(url, fetchOptions, postcode, pageNumber, pageSize)
  }

  static async _fetchFromURL (url, fetchOptions, postcode, pageNumber, pageSize) {
    const offset = pageNumber * pageSize
    const urlWithQueryString = `${url}?postcode=${postcode}&offset=${offset}&maxresults=${pageSize}`

    console.log(`Fetching URL: [${urlWithQueryString}]`)
    const response = await fetch(urlWithQueryString, fetchOptions)

    return response.status === SUCCESS_STATUS ? response.json() : []
  }
}

/**
 * Filters search API search results.
 * If the nameOrNumber is numeric, the results are filtered based on an exact match on BuildingNumber.
 * Otherwise, we try filtering based on the user potentially having entered the full
 * Building Number and Street, rather than just the name/number.
 * If that fails, we try filtering based on a partial match on the entered name/number based
 * on either the BuildingNumber, BuildingName or SubBuildingName fields in the address.
 * @param {*} searchResults
 * @param {*} nameOrNumber
 * @returns
 */
const _filterResults = (searchResults, nameOrNumber) => {
  let filteredResults = []

  if (nameOrNumber) {
    nameOrNumber = _convertToSearchFormat(nameOrNumber)

    if (_isNumeric(nameOrNumber)) {
      filteredResults = searchResults.filter(
        searchResult => searchResult.Address.BuildingNumber === nameOrNumber
      )
    } else {
      filteredResults = searchResults.filter(
        searchResult =>
          _convertToSearchFormat(
            `${searchResult.Address.BuildingNumber}${searchResult.Address.Street}`
          ) === nameOrNumber
      )

      if (!filteredResults.length) {
        filteredResults = _getPartialMatches(
          searchResults,
          nameOrNumber,
          'BuildingNumber'
        )
      }

      if (!filteredResults.length) {
        filteredResults = _getPartialMatches(
          searchResults,
          nameOrNumber,
          'BuildingName'
        )
      }

      if (!filteredResults.length) {
        filteredResults = _getPartialMatches(
          searchResults,
          nameOrNumber,
          'SubBuildingName'
        )
      }
    }
  }

  return filteredResults.length ? filteredResults : searchResults
}

/**
 * Filters address search results, does partial matching based on the field
 * name passed in.
 * @param {*} searchResults The address search results to be filtered
 * @param {*} nameOrNumber  The entered nameOrNumber field
 * @param {*} fieldName     The field name to combine with the Street and be searched
 * @returns
 */
const _getPartialMatches = (searchResults, nameOrNumber, fieldName) => {
  return searchResults.filter(searchResult =>
    _convertToSearchFormat(
      `${searchResult.Address[fieldName]}${searchResult.Address.Street}`
    ).includes(nameOrNumber)
  )
}

/**
 * Converts an array of address search results to title case (e.g. This String Is Title Case)
 * @param {*} searchResults The array of address search results to be converted
 */
const _convertResultsToTitleCase = searchResults => {
  for (const result of searchResults) {
    result.Address.AddressLine = convertToCommaSeparatedTitleCase(
      result.Address.AddressLine
    )

    _convertPostcodeToUpperCase(result.Address)
  }
}

const _convertPostcodeToUpperCase = address => {
  const postcode = address.Postcode
  address.AddressLine = address.AddressLine.substring(
    0,
    address.AddressLine.length - postcode.length
  )

  address.AddressLine += postcode
}

/**
 * Converts a value into a searchable format. Performs the following steps:
 * Converts to upper case and then strips out all non-alphanumeric characters
 * @param {*} value
 * @returns
 */
const _convertToSearchFormat = value =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '')

/**
 * Check if the address lookup certificate is a file or a base64 string.
 * If it's a string convert it back to binary
 * @returns address lookup certificate as binary
 */
const _getCertificate = () => {
  if (config.addressLookupPfxCert) {
    return config.addressLookupPfxCert.toUpperCase().endsWith('.PFX')
      ? readFileSync(config.addressLookupPfxCert)
      : Buffer.from(config.addressLookupPfxCert, 'base64')
  } else {
    return null
  }
}

/**
 * Helper method used to check whether or not a value is numeric, i.e. only contains characters 0 to 9
 * @param {*} value The value to check
 * @returns True if the value is numeric, otherwise false
 */
const _isNumeric = value => value?.match(/^\d*$/g)
