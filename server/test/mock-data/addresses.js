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

module.exports = {
  singleAddress,
  multipleAddresses
}
