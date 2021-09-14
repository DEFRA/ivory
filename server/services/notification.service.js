'use strict'

const { v4: uuidv4 } = require('uuid')

const config = require('../utils/config')

const NotifyClient = require('notifications-node-client').NotifyClient

class NotificationService {
  static async sendConfirmationEmail (isSection2, recipientEmail, data) {
    const notifyClient = new NotifyClient(config.govNotifyKey)

    const personalisation = {
      fullName: data.fullName,
      exemptionType: data.exemptionType,
      submissionReference: data.submissionReference
    }
    const reference = uuidv4()
    const emailReplyToId = null
    try {
      console.log(
        `Sending Section 10 confirmation email to: [${recipientEmail}]`
      )

      await notifyClient.sendEmail(
        isSection2
          ? config.govNotifyTemplateIdConfirmSection2
          : config.govNotifyTemplateIdConfirmSection10,
        recipientEmail,
        {
          personalisation,
          reference,
          emailReplyToId
        }
      )

      return true
    } catch (error) {
      console.log(`Error sending message [${reference}]`, error)
    }

    return false
  }
}

module.exports = NotificationService
