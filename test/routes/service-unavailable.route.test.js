'use strict'

const createServer = require('../../server')

const TestHelper = require('../utils/test-helper')
const { ServerEvents } = require('../../server/utils/constants')

describe('/service-unavailable (503) route', () => {
  let server
  const url = '/service-unavailable'

  const elementIds = {
    pageTitle: 'pageTitle',
    para1: 'para1'
  }

  let document

  beforeAll(async done => {
    server = await createServer()
    server.events.on(ServerEvents.PLUGINS_LOADED, () => {
      done()
    })
  })

  afterAll(() => {
    server.stop()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    beforeEach(async () => {
      document = await TestHelper.submitGetRequest(server, getOptions)
    })

    it('should have the Beta banner', () => {
      TestHelper.checkBetaBanner(document)
    })

    it('should have the Back link', () => {
      TestHelper.checkBackLink(document)
    })

    it('should have the correct page heading', () => {
      const element = document.querySelector(`#${elementIds.pageTitle}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'Sorry, the service is unavailable'
      )
    })

    it('should have the correct paragraph', () => {
      const element = document.querySelector(`#${elementIds.para1}`)
      expect(element).toBeTruthy()
      expect(TestHelper.getTextContent(element)).toEqual(
        'You will be able to use the service later.'
      )
    })
  })
})
