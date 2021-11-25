'use strict'

const { v4: uuidv4 } = require('uuid')

const config = require('../utils/config')
const { EmailTypes } = require('../utils/constants')

const NotifyClient = require('notifications-node-client').NotifyClient

class NotificationService {
  static async sendEmail (emailType, isSection2, recipientEmail, data) {
    const notifyClient = new NotifyClient(config.govNotifyKey)

    const templateId = _getTemplateId(emailType, isSection2)

    const personalisation = {
      fullName: data.fullName,
      exemptionType: data.exemptionType,
      submissionReference: data.submissionReference
    }
    const reference = uuidv4()
    const emailReplyToId = null
    try {
      console.log(
        `Sending Section ${
          isSection2 ? '2' : '10'
        } ${emailType} email to: [${recipientEmail}]`
      )

      await notifyClient.sendEmail(templateId, recipientEmail, {
        personalisation,
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

const _getTemplateId = (emailType, isSection2) => {
  let templateId
  if (emailType === EmailTypes.CONFIRMATION_EMAIL) {
    templateId = isSection2
      ? config.govNotifyTemplateIdConfirmSection2
      : config.govNotifyTemplateIdConfirmSection10
  } else {
    templateId = config.govNotifyTemplateIdEmailToOwnerSection10
  }

  return templateId
}

module.exports = NotificationService
