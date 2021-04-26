const singleAddress = [
  {
    Address: {
      AddressLine: 'BUCKINGHAM PALACE, LONDON, SW1A 1AA',
      SubBuildingName: 'BUCKINGHAM PALACE',
      Town: 'LONDON',
      County: 'CITY OF WESTMINSTER',
      Postcode: 'SW1A 1AA',
      Country: 'ENGLAND',
      XCoordinate: 529090,
      YCoordinate: 179645,
      UPRN: '10033544614',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  }
]

const multipleAddresses = [
  {
    Address: {
      AddressLine: 'BBC CYMRU WALES, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'BBC CYMRU WALES',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319753,
      YCoordinate: 174304,
      UPRN: '10090487771',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: 'LOOKOUT CAFE BAR, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'LOOKOUT CAFE BAR',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319414,
      YCoordinate: 173990,
      UPRN: '10092985305',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: 'WORLD OF BOATS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'WORLD OF BOATS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319419,
      YCoordinate: 173966,
      UPRN: '10090716498',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  }
]

module.exports = {
  singleAddress,
  multipleAddresses
}
