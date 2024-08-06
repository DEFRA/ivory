'use strict'

jest.mock('randomstring')
const RandomString = require('randomstring')

const {
  convertToCommaSeparatedTitleCase,
  generateSubmissionReference
} = require('../../server/utils/general')

describe('General utils', () => {
  describe('convertToCommaSeparatedTitleCase method', () => {
    it('should convert strings to title case', () => {
      expect(convertToCommaSeparatedTitleCase('')).toEqual('')

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

  describe('generateSubmissionReference method', () => {
    it('should generate a random submission reference', () => {
      const submissionReference = 'ABCDEF'
      RandomString.generate = jest.fn().mockReturnValue(submissionReference)

      expect(generateSubmissionReference()).toEqual(submissionReference)
    })
  })
})
