const result = {
  resize: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockReturnThis()
}

module.exports = jest.fn(() => result)
