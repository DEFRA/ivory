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
      AddressLine: 'BAIT STUDIO, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'BAIT STUDIO',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319607,
      YCoordinate: 174255,
      UPRN: '10092985788',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'BARA MENYN LTD, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'BARA MENYN LTD',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319607,
      YCoordinate: 174255,
      UPRN: '10092985858',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'BOOM CYMRU TV LTD, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'BOOM CYMRU TV LTD',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319753,
      YCoordinate: 174304,
      UPRN: '10092984928',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine: 'BOOMERANG, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'BOOMERANG',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319607,
      YCoordinate: 174255,
      UPRN: '10092986925',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'GORILLA TV LTD, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'GORILLA TV LTD',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319607,
      YCoordinate: 174255,
      UPRN: '10092985666',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'HARLEQUIN AGENCY LTD, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'HARLEQUIN AGENCY LTD',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319607,
      YCoordinate: 174255,
      UPRN: '10092985665',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'HARTSWOOD WEST, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'HARTSWOOD WEST',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319607,
      YCoordinate: 174255,
      UPRN: '10092986237',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
  {
    Address: {
      AddressLine:
        'SEQUENCE COLLECTIVE LTD, GLOWORKS, HEOL PORTH TEIGR, CARDIFF, CF10 4GA',
      SubBuildingName: 'SEQUENCE COLLECTIVE LTD',
      BuildingName: 'GLOWORKS',
      Street: 'HEOL PORTH TEIGR',
      Town: 'CARDIFF',
      Postcode: 'CF10 4GA',
      Country: 'WALES',
      XCoordinate: 319753,
      YCoordinate: 174304,
      UPRN: '10092984929',
      Match: '1',
      MatchDescription: 'EXACT',
      Language: 'EN'
    }
  },
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
