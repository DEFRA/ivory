'use strict'

const { convertToTitleCase } = require('../../server/utils/general')

describe('General utils', () => {
  describe('convertToTitleCase method', () => {
    it('should convert strings to title case', () => {
      expect(convertToTitleCase('')).toBeUndefined()

      expect(convertToTitleCase('the quick brown fox')).toEqual(
        'The Quick Brown Fox'
      )

      expect(convertToTitleCase('THE, QUICK, BROWN, FOX')).toEqual(
        'The, Quick, Brown, Fox'
      )
    })
  })
})
