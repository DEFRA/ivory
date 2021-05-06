'use strict'

const https = require('https')
const fetch = require('node-fetch')
const { readFileSync } = require('fs')

const { convertToTitleCase } = require('../utils/general')

const config = require('../utils/config')

const PAGE_SIZE = 100
const POSTCODE_SEARCH_ENDPOINT = '/ws/rest/DEFRA/v1/address/postcodes'

module.exports = class AddressService {
  static async addressSearch (nameOrNumber, postcode, pageSize = PAGE_SIZE) {
    let pageNumber = 0
    const json = await AddressService._queryAddressEndpoint(
      postcode,
      pageNumber,
      pageSize
    )

    let searchResults = json && json.results ? json.results : []

    if (json && json.header && json.header.totalresults) {
      while (searchResults.length < parseInt(json.header.totalresults)) {
        pageNumber++
        const additionalJson = await AddressService._queryAddressEndpoint(
          postcode,
          pageNumber,
          pageSize
        )
        const additionalSearchResults =
          additionalJson && additionalJson.results ? additionalJson.results : []

        searchResults = searchResults.concat(additionalSearchResults)
      }

      if (nameOrNumber) {
        searchResults = searchResults.filter(searchResult => {
          const buildingName = searchResult.Address.BuildingName
            ? searchResult.Address.BuildingName.toUpperCase()
            : ''

          return (
            buildingName === nameOrNumber.toUpperCase() ||
            searchResult.Address.BuildingNumber === nameOrNumber
          )
        })
      }
    }

    _convertResultsToTitleCase(searchResults)

    return searchResults
  }

  static async _queryAddressEndpoint (postcode, pageNumber, pageSize) {
    const authOptions = {
      passphrase: config.addressLookupPassphrase,
      pfx: _getCertificate(),
      keepAlive: false
    }
    const tlsConfiguredAgent = new https.Agent(authOptions)

    const searchOptions = {
      agent: tlsConfiguredAgent
    }

    const offset = pageNumber * pageSize
    const querystringParams = `postcode=${postcode}&offset=${offset}&maxresults=${pageSize}`

    const url = `${config.addressLookupUrl}${POSTCODE_SEARCH_ENDPOINT}?${querystringParams}`
    console.log(`Fetching URL: [${url}]`)

    const response = await fetch(url, searchOptions)

    return response.json()
  }
}

const _convertResultsToTitleCase = searchResults => {
  for (const result of searchResults) {
    result.Address.AddressLine = convertToTitleCase(result.Address.AddressLine)

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
 * Check if the address lookup certificate is a file or a base64 string.
 * If it's a string convert it back to binary
 * @returns address lookup certificate as binary
*/
const _getCertificate = () => {
  if (config.addressLookupPfxCert) {
    return config.addressLookupPfxCert.toUpperCase().endsWith('.PFX')
      ? readFileSync(config.addressLookupPfxCert)
      : Buffer.from(config.addressLookupPfxCert, 'base64')
  }
}
