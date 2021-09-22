'use strict'

const RedisService = require('../../server/services/redis.service')
const TestHelper = require('../utils/test-helper')

describe('Eligibility checker - do not need service route', () => {
  let server
  const url = '/eligibility-checker/do-not-need-service'

  const elementIds = {
    pageTitle: 'pageTitle',
    finish: 'finish',
    para1: 'para1',
    para2: 'para2',
    subHeading: 'subHeading',
    para3: 'para3',
    bullet1: 'bullet1',
    bullet2: 'bullet2',
    bullet3: 'bullet3',
    citesLink: 'citesLink'
  }

  let document

  beforeAll(async () => {
    server = await TestHelper.createServer()
  })

  afterAll(async () => {
    await server.stop()
  })

  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    const getOptions = {
      method: 'GET',
      url
    }

    describe('GET: Common content', () => {
      beforeEach(async () => {
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should have the Beta banner', () => {
        TestHelper.checkBetaBanner(document)
      })

      it('should have the Back link', () => {
        TestHelper.checkBackLink(document, true)
      })

      it('should display the correct page heading', () => {
        const element = document.querySelector(`#${elementIds.pageTitle}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You don’t need to tell us about this item'
        )
      })

      it('should display the correct bullet list header', () => {
        const element = document.querySelector(`#${elementIds.para3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'As part of the Convention on International Trade in Endangered Species of Wild Fauna and Flora (CITES), you may need to apply for:'
        )
      })

      it('should display the correct bullet list', () => {
        let element = document.querySelector(`#${elementIds.bullet1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'a CITES article 10 certificate, if your item is in the UK and was made after 3 March 1947'
        )

        element = document.querySelector(`#${elementIds.bullet2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'an EU internal trading certificate, if your item is in an EU country'
        )

        element = document.querySelector(`#${elementIds.bullet3}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'a CITES permit, if your item will cross certain national borders when its sold or hired out'
        )
      })

      it('should have the correct CITES link', () => {
        const element = document.querySelector(`#${elementIds.citesLink}`)
        TestHelper.checkLink(
          element,
          'Find out more about applying for CITES permits and certificates',
          'https://cites.org/eng'
        )
      })

      it('should have the correct Call to Action button', () => {
        const element = document.querySelector(`#${elementIds.finish}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Finish and return to GOV.UK'
        )
      })
    })

    describe('GET: Dynamic content, not elephant ivory', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('false')
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should display the correct help text', () => {
        const element = document.querySelector(`#${elementIds.para1}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'You only need to tell us if you are selling or hiring out an item that contains elephant ivory.'
        )
      })
    })

    describe('GET: Dynamic content, museum', () => {
      beforeEach(async () => {
        RedisService.get = jest.fn().mockResolvedValue('true')
        document = await TestHelper.submitGetRequest(server, getOptions)
      })

      it('should display the correct help text', () => {
        let element = document.querySelector(`#${elementIds.para2}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Qualifying accredited museums do not need to tell us when they sell or hire out ivory items to each other.'
        )

        element = document.querySelector(`#${elementIds.subHeading}`)
        expect(element).toBeTruthy()
        expect(TestHelper.getTextContent(element)).toEqual(
          'Other legal obligations when you sell or hire out the item'
        )
      })
    })
  })
})

const _createMocks = () => {
  TestHelper.createMocks()
}
