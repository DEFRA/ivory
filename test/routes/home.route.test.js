'use strict'

const TestHelper = require('../utils/test-helper')

describe('/ route', () => {
  let server
  const url = '/'
  const nextUrl = '/eligibility-checker/how-certain'

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    it('should redirect to the "How certain" route', async () => {
      const response = await TestHelper.submitPostRequest(
        server,
        getOptions,
        302
      )

      expect(response.headers.location).toEqual(nextUrl)
    })
  })
})
