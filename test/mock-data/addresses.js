const singleAddress = [
  {
    Address: {
      AddressLine: 'BUCKINGHAM PALACE, WESTMINSTER, LONDON, SW1A 1AA',
      SubBuildingName: 'BUCKINGHAM PALACE',
      Locality: 'WESTMINSTER',
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
      AddressLine: '5, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '5',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288596,
      YCoordinate: 67392,
      UPRN: '100040321456',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '7, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '7',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288610,
      YCoordinate: 67404,
      UPRN: '100040321457',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '9, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '9',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288617,
      YCoordinate: 67408,
      UPRN: '100040321458',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '11, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '11',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288633,
      YCoordinate: 67410,
      UPRN: '100040321459',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '13, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '13',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288650,
      YCoordinate: 67409,
      UPRN: '100040321460',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '15, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '15',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288657,
      YCoordinate: 67408,
      UPRN: '100040321461',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '17, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '17',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288671,
      YCoordinate: 67402,
      UPRN: '100040321462',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '19, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '19',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288690,
      YCoordinate: 67391,
      UPRN: '100040321463',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: '21, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingNumber: '21',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288702,
      YCoordinate: 67379,
      UPRN: '10091650965',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        '21A, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingName: '21A',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288710,
      YCoordinate: 67367,
      UPRN: '10091650966',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'MIMOSA, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
      BuildingName: 'MIMOSA',
      Street: 'FLUDER CRESCENT',
      Locality: 'KINGSKERSWELL',
      Town: 'NEWTON ABBOT',
      County: 'TEIGNBRIDGE',
      Postcode: 'TQ12 5JE',
      Country: 'ENGLAND',
      XCoordinate: 288723,
      YCoordinate: 67352,
      UPRN: '100040321466',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  }
]

const singleAddressV2 = [
  {
    addressLine: 'BUCKINGHAM PALACE, WESTMINSTER, LONDON, SW1A 1AA',
    subbuildingName: 'BUCKINGHAM PALACE',
    locality: 'WESTMINSTER',
    town: 'LONDON',
    cermonialCounty: 'CITY OF WESTMINSTER',
    postcode: 'SW1A 1AA',
    country: 'ENGLAND',
    xCoordinate: 529090,
    yCoordinate: 179645,
    uprn: '10033544614',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  }
]

const multipleAddressesV2 = [
  {
    addressLine: '5, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '5',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288596,
    yCoordinate: 67392,
    uprn: '100040321456',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '7, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '7',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288610,
    yCoordinate: 67404,
    uprn: '100040321457',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '9, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '9',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288617,
    yCoordinate: 67408,
    uprn: '100040321458',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '11, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '11',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288633,
    yCoordinate: 67410,
    uprn: '100040321459',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '13, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '13',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288650,
    yCoordinate: 67409,
    uprn: '100040321460',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '15, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '15',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288657,
    yCoordinate: 67408,
    uprn: '100040321461',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '17, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '17',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288671,
    yCoordinate: 67402,
    uprn: '100040321462',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '19, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '19',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288690,
    yCoordinate: 67391,
    uprn: '100040321463',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '21, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingNumber: '21',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288702,
    yCoordinate: 67379,
    uprn: '10091650965',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: '21A, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingName: '21A',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288710,
    yCoordinate: 67367,
    uprn: '10091650966',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  },
  {
    addressLine: 'MIMOSA, FLUDER CRESCENT, KINGSKERSWELL, NEWTON ABBOT, TQ12 5JE',
    buildingName: 'MIMOSA',
    street: 'FLUDER CRESCENT',
    locality: 'KINGSKERSWELL',
    town: 'NEWTON ABBOT',
    cermonialCounty: 'TEIGNBRIDGE',
    postcode: 'TQ12 5JE',
    country: 'ENGLAND',
    xCoordinate: 288723,
    yCoordinate: 67352,
    uprn: '100040321466',
    match: '1',
    matchDescription: 'EXACT',
    language: 'EN'
  }
]

module.exports = {
  singleAddress,
  multipleAddresses,
  singleAddressV2,
  multipleAddressesV2
}
