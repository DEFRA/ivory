'use strict'

const { v4: uuidv4 } = require('uuid')

const config = require('../utils/config')

const NotifyClient = require('notifications-node-client').NotifyClient

class NotificationService {
  static async sendEmail (templateId, recipientEmail, payload) {
    const notifyClient = new NotifyClient(config.govNotifyKey)

    const reference = uuidv4()
    const emailReplyToId = null
    try {
      console.log(`Sending email ${templateId} to: [${recipientEmail}]`)

      await notifyClient.sendEmail(templateId, recipientEmail, {
        personalisation: payload,
        reference,
        emailReplyToId
      })

      return true
    } catch (error) {
      console.error(`Error sending message [${reference}]`, error)
    }

    return false
  }
}

module.exports = NotificationService
