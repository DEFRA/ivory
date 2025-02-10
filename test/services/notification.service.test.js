'use strict'

jest.mock('notifications-node-client')
const NotifyClient = require('notifications-node-client').NotifyClient

const NotificationService = require('../../server/services/notification.service')

const { ItemType } = require('../../server/utils/constants')

describe('Address service', () => {
  beforeEach(() => {
    _createMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('makePayment method', () => {
    const templateId = 'TEMPLATE_ID'
    const recipientEmail = 'RECIPIENT_EMAIL'
    const submissionReference = 'SUBMISSION_REFERENCE'
    const recipientName = 'RECIPIENT_NAME'

    it('should make payments using the payment service', async () => {
      const result = await NotificationService.sendEmail(
        templateId,
        recipientEmail,
        {
          fullName: recipientName,
          exemptionType: ItemType.MUSICAL,
          submissionReference
        }
      )

      expect(result).toBeTruthy()
      expect(NotifyClient.prototype.sendEmail).toBeCalledTimes(1)
      expect(NotifyClient.prototype.sendEmail).toBeCalledWith(
        templateId,
        recipientEmail,
        {
          personalisation: {
            exemptionType: ItemType.MUSICAL,
            fullName: recipientName,
            submissionReference
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
