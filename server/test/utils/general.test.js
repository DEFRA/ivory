'use strict'

const {
  convertToCommaSeparatedTitleCase
} = require('../../server/utils/general')

describe('General utils', () => {
  describe('convertToCommaSeparatedTitleCase method', () => {
    it('should convert strings to title case', () => {
      expect(convertToCommaSeparatedTitleCase('')).toBeUndefined()

      expect(convertToCommaSeparatedTitleCase('the quick brown fox')).toEqual(
        'The Quick Brown Fox'
      )

      expect(
        convertToCommaSeparatedTitleCase('THE, QUICK, BROWN, FOX')
      ).toEqual('The, Quick, Brown, Fox')

      expect(
        convertToCommaSeparatedTitleCase('THE\nQUICK\nBROWN\nFOX')
      ).toEqual('The, Quick, Brown, Fox')

      expect(
        convertToCommaSeparatedTitleCase('THE\r\nQUICK\r\nBROWN\r\nFOX')
      ).toEqual('The, Quick, Brown, Fox')
    })
  })
})
