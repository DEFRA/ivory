'use strict'

const { v4: uuidv4 } = require('uuid')

const config = require('../utils/config')

const NotifyClient = require('notifications-node-client').NotifyClient

class NotificationService {
  static sendConfirmationEmail (email, isSection2, data) {
    const notifyClient = new NotifyClient(config.govNotifyKey)

    const templateId = isSection2
      ? config.govNotifyTemplateIdConfirmSection2
      : config.govNotifyTemplateIdConfirmSection10

    NotificationService._sendMessage(notifyClient, templateId, email, data)
  }

  static _sendMessage (notifyClient, templateId, recipientEmail, data) {
    const personalisation = {
      fullName: data.fullName,
      exemptionType: data.exemptionType,
      submissionReference: data.submissionReference
    }
    const reference = uuidv4()
    const emailReplyToId = null
    try {
      // logger.info(
      //   `Sending document request ID: [${reference}] to email: [${recipientEmail}] using template ID :[${templateId}] for permit number: [${personalisation.permitNumber}] furtherInformation: [${personalisation.furtherInformation}]`
      // )
      console.log(
        `Sending email to: [${recipientEmail}] using template ID :[${templateId}]`
      )
      notifyClient.sendEmail(templateId, recipientEmail, {
        personalisation,
        reference,
        emailReplyToId
      })
    } catch (error) {
      console.log(`Error sending message [${reference}]`, error)
    }
  }
}

module.exports = NotificationService
