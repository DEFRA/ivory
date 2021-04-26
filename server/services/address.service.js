'use strict'

const config = require('../utils/config')
const fetch = require('node-fetch')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const https = require('https')

const PAGE_SIZE = 100
const POSTCODE_SEARCH_ENDPOINT = '/ws/rest/DEFRA/v1/address/postcodes'

module.exports = class AddressService {
  static async addressSearch (nameOrNumber, postcode) {
    const json = await AddressService._queryAddressEndpoint(postcode)

    let searchResults = json && json.results ? json.results : []

    if (json && json.header && json.header.totalresults) {
      let pageNumber = 0
      while (searchResults.length < parseInt(json.header.totalresults)) {
        pageNumber++
        const additionalJson = await AddressService._queryAddressEndpoint(
          postcode,
          pageNumber
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

    return searchResults
  }

  static async _queryAddressEndpoint (postcode, pageNumber = 0) {
    const authOptions = {
      passphrase: config.addressLookupPassphrase,
      pfx: readFileSync(resolve(config.addressLookupPfxCert)),
      keepAlive: false
    }
    const tlsConfiguredAgent = new https.Agent(authOptions)

    const searchOptions = {
      agent: tlsConfiguredAgent
    }

    const offset = pageNumber * PAGE_SIZE
    const querystringParams = `postcode=${postcode}&offset=${offset}&maxresults=${PAGE_SIZE}`

    const response = await fetch(
      `${config.addressLookupUrl}${POSTCODE_SEARCH_ENDPOINT}?${querystringParams}`,
      searchOptions
    )

    return response.json()
  }
}
