'use strict'

const nock = require('nock')
const config = require('../../server/utils/config')

const { multipleAddresses } = require('../mock-data/addresses')
const AddressService = require('../../server/services/address.service')

describe('Address service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('addressSearch method', () => {
    it('should return muiltiple addresses if no name/number entered', async () => {
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
  results: multipleAddresses.slice(0, 1)
}

const next1Result = {
  header: {
    totalresults: multipleAddresses.length
  },
  results: multipleAddresses.slice(1, multipleAddresses.length)
}
