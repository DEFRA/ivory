'use strict'

jest.mock('notifications-node-client')
const NotifyClient = require('notifications-node-client').NotifyClient

const NotificationService = require('../../server/services/notification.service')

const config = require('../../server/utils/config')
const { ItemType, EmailTypes } = require('../../server/utils/constants')

describe('Address service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('makePayment method', () => {
    const RECIPIENT_EMAIL = 'RECIPIENT_EMAIL'
    const SUBMISSION_REFERENCE = 'SUBMISSION_REFERENCE'
    const RECIPIENT_NAME = 'RECIPIENT_NAME'

    it('should make payments using the payment service', async () => {
      const result = await NotificationService.sendEmail(
        EmailTypes.CONFIRMATION_EMAIL,
        false,
        RECIPIENT_EMAIL,
        {
          fullName: RECIPIENT_NAME,
          exemptionType: ItemType.MUSICAL,
          submissionReference: SUBMISSION_REFERENCE
        }
      )

      expect(result).toBeTruthy()
      expect(NotifyClient.prototype.sendEmail).toBeCalledTimes(1)
      expect(NotifyClient.prototype.sendEmail).toBeCalledWith(
        config.govNotifyTemplateIdConfirmSection10,
        RECIPIENT_EMAIL,
        {
          personalisation: {
            exemptionType: ItemType.MUSICAL,
            fullName: RECIPIENT_NAME,
            submissionReference: SUBMISSION_REFERENCE
          },
          reference: expect.any(String),
          emailReplyToId: null
        }
      )
    })
  })
})

const _createMocks = () => {
  NotifyClient.prototype.sendEmail = jest.fn()
}
