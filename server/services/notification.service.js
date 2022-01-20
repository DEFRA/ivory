'use strict'

import { v4 as uuidv4 } from 'uuid';
import config from '../utils/config.js';
import { EmailTypes } from '../utils/constants.js';
import { NotifyClient } from 'notifications-node-client';

class NotificationService {
  static async sendEmail (emailType, isSection2, recipientEmail, data) {
    const notifyClient = new NotifyClient(config.govNotifyKey)

    const templateId = _getTemplateId(emailType, isSection2)

    const personalisation = {
      fullName: data.fullName,
      exemptionType: data.exemptionType,
      submissionReference: data.submissionReference,
      certificateNumber: data.certificateNumber
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
  } else if (emailType === EmailTypes.CONFIRMATION_EMAIL_RESELLING) {
    templateId = config.govNotifyTemplateIdConfirmSection2Reselling
  } else {
    templateId = config.govNotifyTemplateIdEmailToOwnerSection10
  }

  return templateId
}

export default NotificationService;
