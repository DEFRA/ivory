'use strict'

const nock = require('nock')
const config = require('../../server/utils/config')

jest.mock('../../server/services/active-directory-auth.service')
const ActiveDirectoryAuthService = require('../../server/services/active-directory-auth.service')

const { multipleAddresses, multipleAddressesV2 } = require('../mock-data/addresses')
const AddressService = require('../../server/services/address.service')

describe('Address service', () => {
  beforeEach(() => {
    _createMocks()
    _createMocksV2()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('addressSearch method using v1 API', () => {
    beforeEach(() => {
      config.addressLookupEnabled = true
      config.addressLookupUseV2 = false
    })

    it('should return multiple addresses if no name/number entered', async () => {
      const results = await AddressService.addressSearch('', 'TQ12 5JE')
      expect(results.length).toEqual(multipleAddresses.length)
      expect(results[0].Address.AddressLine).toEqual(
        '5, Fluder Crescent, Kingskerswell, Newton Abbot, TQ12 5JE'
      )
    })

    it('should return a single addresses if a name/number is entered', async () => {
      const results = await AddressService.addressSearch('15', 'TQ12 5JE')
      expect(results.length).toEqual(1)
    })

    it('should call the API multiple times to return all addresses if the page size is smaller than the total number of results', async () => {
      const pageSize = 10
      const results = await AddressService.addressSearch(
        '',
        'TQ12 5JE',
        pageSize
      )
      expect(results.length).toEqual(11)
    })

    it('should return an empty list when no results are returned', async () => {
      const results = await AddressService.addressSearch('', 'XX99 9XX')
      expect(results.length).toEqual(0)
    })

    it('should return an empty list when the lookup fails', async () => {
      const results = await AddressService.addressSearch('', 'ERROR')
      expect(results.length).toEqual(0)
    })
  })

  describe('addressSearch method using v2 API', () => {
    beforeEach(() => {
      config.addressLookupEnabled = true
      config.addressLookupUseV2 = true
    })

    it('should return multiple addresses if no name/number entered', async () => {
      const results = await AddressService.addressSearch('', 'TQ12 5JE')
      expect(results.length).toEqual(multipleAddresses.length)
      expect(results[0].Address.AddressLine).toEqual(
        '5, Fluder Crescent, Kingskerswell, Newton Abbot, TQ12 5JE'
      )
    })

    it('should return a single addresses if a name/number is entered', async () => {
      const results = await AddressService.addressSearch('15', 'TQ12 5JE')
      expect(results.length).toEqual(1)
    })

    it('should call the API multiple times to return all addresses if the page size is smaller than the total number of results', async () => {
      const pageSize = 10
      const results = await AddressService.addressSearch(
        '',
        'TQ12 5JE',
        pageSize
      )
      expect(results.length).toEqual(11)
      expect(ActiveDirectoryAuthService.getTokenForAddressLookup).toBeCalledTimes(2)
    })
  })

  describe('addressSearch method disabled', () => {
    beforeEach(() => {
      config.addressLookupEnabled = false
    })

    it('should return no addresses if a name/number is entered', async () => {
      const results = await AddressService.addressSearch('15', 'TQ12 5JE')
      expect(results.length).toEqual(0)
    })
  })
})

const _createMocks = () => {
  nock(`${config.addressLookupUrl}`)
    .get(
      '/ws/rest/DEFRA/v1/address/postcodes?postcode=TQ12 5JE&offset=0&maxresults=100'
    )
    .reply(200, searchResults)

  nock(`${config.addressLookupUrl}`)
    .get(
      '/ws/rest/DEFRA/v1/address/postcodes?postcode=TQ12 5JE&offset=0&maxresults=10'
    )
    .reply(200, first10Results)

  nock(`${config.addressLookupUrl}`)
    .get(
      '/ws/rest/DEFRA/v1/address/postcodes?postcode=TQ12 5JE&offset=10&maxresults=10'
    )
    .reply(200, next1Result)

  nock(`${config.addressLookupUrl}`)
    .get(
      '/ws/rest/DEFRA/v1/address/postcodes?postcode=XX99 9XX&offset=0&maxresults=100'
    )
    .reply(200, noResult)

  nock(`${config.addressLookupUrl}`)
    .get(
      '/ws/rest/DEFRA/v1/address/postcodes?postcode=ERROR&offset=0&maxresults=100'
    )
    .reply(400, noResult)
}

const _createMocksV2 = () => {
  ActiveDirectoryAuthService.getTokenForAddressLookup = jest.fn().mockResolvedValue('THE_TOKEN')
  nock(`${config.addressLookupUrlV2}`)
    .get(
      '/api/address-lookup/v2.1/addresses?postcode=TQ12 5JE&offset=0&maxresults=100'
    )
    .reply(200, searchResultsV2)

  nock(`${config.addressLookupUrlV2}`)
    .get(
      '/api/address-lookup/v2.1/addresses?postcode=TQ12 5JE&offset=0&maxresults=10'
    )
    .reply(200, first10ResultsV2)

  nock(`${config.addressLookupUrlV2}`)
    .get(
      '/api/address-lookup/v2.1/addresses?postcode=TQ12 5JE&offset=10&maxresults=10'
    )
    .reply(200, next1ResultV2)
}

const searchResults = {
  header: {
    totalresults: multipleAddresses.length
  },
  results: multipleAddresses
}

const first10Results = {
  header: {
    totalresults: multipleAddresses.length
  },
  results: multipleAddresses.slice(0, 10)
}

const next1Result = {
  header: {
    totalresults: multipleAddresses.length
  },
  results: multipleAddresses.slice(10, multipleAddresses.length)
}

const noResult = {
  header: {
    totalresults: 0
  }
}

const searchResultsV2 = {
  header: {
    totalresults: multipleAddressesV2.length
  },
  results: multipleAddressesV2
}

const first10ResultsV2 = {
  header: {
    totalresults: multipleAddressesV2.length
  },
  results: multipleAddressesV2.slice(0, 10)
}

const next1ResultV2 = {
  header: {
    totalresults: multipleAddressesV2.length
  },
  results: multipleAddressesV2.slice(10, multipleAddressesV2.length)
}
