'use strict'

const TestHelper = require('../utils/test-helper')

describe('/ route', () => {
  let server
  const url = '/use-checker'
  const nextUrl = '/?useChecker=true'

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

    it('should redirect to the home screen with the useChecker querystring parameter', async () => {
      const response = await TestHelper.submitGetRequest(
        server,
        getOptions,
        302,
        false
      )

      expect(response.headers.location).toEqual(nextUrl)
    })
  })
})
