const NOTIFICATION_TIMEOUT = 5000;
const TARGET_COMPLETION_DATE_DAYS = 49;
const CERTIFICATE_LINK_EXPIRY_DATE_DAYS = 0;
const PI_LINK_EXPIRY_DATE_DAYS = 35;
const IVORY_SUPERUSER_ROLE = 'Ivory Superuser';

const DataVerseFieldName = {
  ALREADY_HAS_CERTIFICATE: 'cre2c_alreadyhascertificate',
  APPLICANT_ADDRESS: 'cre2c_applicantaddress',
  APPLICANT_EMAIL: 'cre2c_applicantemail',
  APPLICANT_NAME: 'cre2c_applicantname',
  APPLICANT_POSTCODE: 'cre2c_applicantpostcode',
  APPLIED_BEFORE: 'cre2c_appliedbefore',
  ASSESSMENT_SUMMARY: 'cre2c_assessmentsummary',
  ASSESSMENT_SUPPORTING_EVIDENCE: 'cre2c_assessmentsupportingevidence',
  CAPACITY_OTHER: 'cre2c_capacityother',
  CAPACITY: 'cre2c_capacity',
  CERTIFICATE_ISSUE_DATE: 'cre2c_certificateissuedate',
  CERTIFICATE_KEY: 'cre2c_certificatekey',
  CERTIFICATE_LINK_EXPIRY: 'cre2c_certificatelinkexpiry',
  CERTIFICATE_LINK: 'cre2c_certificatelink',
  CERTIFICATE_NUMBER: 'cre2c_certificatenumber',
  CERTIFICATE: 'cre2c_certificate',
  DATE_COI_SENT_TO_PI: 'cre2c_datecoisenttopi',
  DATE_DETAILS_SENT_TO_PI: 'cre2c_datedetailsdenttopi',
  DATE_OF_PI_RESPONSE: 'cre2c_dateofpiresponse',
  DATE_RECOMMENDATION_RECEIVED: 'cre2c_daterecommendationreceived',
  DATE_SENT_TO_PI: 'cre2c_datedetailssenttopi',
  DATE_STATUS_APPLIED: 'cre2c_datestatusapplied',
  DISTINGUISHING_FEATURES: 'cre2c_uniquefeatures',
  EXEMPTION_CATEGORY: 'cre2c_exemptioncategory',
  EXEMPTION_TYPE: 'cre2c_exemptiontype',
  HAS_DISTINGUISHING_FEATURES: 'cre2c_hasuniquefeatures',
  INTENTION: 'cre2c_intention',
  ITEM_SUMMARY: 'cre2c_itemsummary',
  MANUALLY_CREATED: 'cre2c_manuallycreated',
  NAME: 'cre2c_name',
  OWNED_BY_APPLICANT: 'cre2c_ownedbyapplicant',
  OWNER_ADDRESS: 'cre2c_owneraddress',
  OWNER_EMAIL: 'cre2c_owneremail',
  OWNER_NAME: 'cre2c_ownername',
  OWNER_POSTCODE: 'cre2c_ownerpostcode',
  OWNER: 'ownerid',
  PAYMENT_REFERENCE: 'cre2c_paymentreference',
  PHOTO_1: 'cre2c_photo1',
  PHOTO_2: 'cre2c_photo2',
  PHOTO_3: 'cre2c_photo3',
  PHOTO_4: 'cre2c_photo4',
  PHOTO_5: 'cre2c_photo5',
  PHOTO_6: 'cre2c_photo6',
  PI_ASSIGNMENT_NOTES: 'cre2c_piassignmentnotes',
  PI_LINK_EXPIRY: 'cre2c_pilinkexpiry',
  PI_LINK: 'cre2c_pilink',
  PRESCRIBED_INSTITUTE: 'cre2c_ivoryprescribedinsitute',
  PREVIOUS_APPLICANT_ADDRESS: 'cre2c_previousapplicantaddress',
  PREVIOUS_APPLICANT_EMAIL: 'cre2c_previousapplicantemail',
  PREVIOUS_APPLICANT_NAME: 'cre2c_previousapplicantname',
  PREVIOUS_APPLICANT_POSTCODE: 'cre2c_previousapplicantpostcode',
  PREVIOUS_APPLICATION_NUMBER: 'cre2c_previousapplicationnumber',
  PREVIOUS_CAPACITY_OTHER: 'cre2c_previouscapacityother',
  PREVIOUS_CAPACITY: 'cre2c_previouscapacity',
  PREVIOUS_OWNED_BY_APPLICANT: 'cre2c_previousownedbyapplicant',
  PREVIOUS_OWNER_ADDRESS: 'cre2c_previousowneraddress',
  PREVIOUS_OWNER_EMAIL: 'cre2c_previousowneremail',
  PREVIOUS_OWNER_NAME: 'cre2c_previousownername',
  PREVIOUS_OWNER_POSTCODE: 'cre2c_previousownerpostcode',
  PREVIOUS_SELLING_ON_BEHALF_OF: 'cre2c_previoussellingonbehalfof',
  PREVIOUS_WORK_FOR_A_BUSINESS: 'cre2c_previousworkforabusiness',
  REVOKED_CERTIFICATE_NUMBER: 'cre2c_revokedcertificatenumber',
  SECTION_10_CASE_ID: 'cre2c_ivorysection10caseid',
  SECTION_2_CASE_ID: 'cre2c_ivorysection2caseid',
  SELLING_ON_BEHALF_OF: 'cre2c_sellingonbehalfof',
  STATE_CODE: 'statecode',
  STATUS: 'cre2c_status',
  SUBMISSION_DATE: 'cre2c_submissiondate',
  SUBMISSION_REFERENCE: 'cre2c_submissionreference',
  SUPPORTING_EVIDENCE_1_NAME: 'cre2c_supportingevidence1_name',
  SUPPORTING_EVIDENCE_1: 'cre2c_supportingevidence1',
  TARGET_COMPLETION_DATE: 'cre2c_targetcompletiondate',
  WHEN_IT_WAS_MADE: 'cre2c_whenitwasmade',
  WHERE_IS_THE_IVORY: 'cre2c_wherestheivory',
  WHERE_IT_WAS_MADE: 'cre2c_whereitwasmade',
  WHY_AGE_EXEMPT_OTHER_REASON: 'cre2c_whyageexemptotherreason',
  WHY_AGE_EXEMPT: 'cre2c_whyageexempt',
  WHY_IVORY_EXEMPT_OTHER_REASON: 'cre2c_whyivoryexemptotherreason',
  WHY_IVORY_EXEMPT: 'cre2c_whyivoryexempt',
  WHY_IVORY_INTEGRAL: 'cre2c_whyivoryintegral',
  WHY_OUTSTANDINLY_VALUABLE: 'cre2c_whyoutstandinglyvaluable',
  WORK_FOR_A_BUSINESS: 'cre2c_workforabusiness'
};

const ExemptionTypeLookup = {
  MUSICAL: 881990000,
  TEN_PERCENT: 881990001,
  MINIATURE: 881990002,
  MUSEUM: 881990003,
  HIGH_VALUE: 881990004
};

const IvoryVolumeLookup = {
  CLEAR_FROM_LOOKING_AT_IT: 881990000,
  MEASURED_IT: 881990001,
  WRITTEN_VERIFICATION: 881990002,
  OTHER_REASON: 881990003
};

const AgeExemptionReasonLookup = {
  STAMP_OR_SERIAL: 881990000,
  DATED_RECEIPT: 881990001,
  DATED_PUBLICATION: 881990002,
  BEEN_IN_FAMILY_1975: 881990003,
  BEEN_IN_FAMILY_1947: 881990004,
  BEEN_IN_FAMILY_1918: 881990005,
  EXPERT_VERIFICATION: 881990006,
  PROFESSIONAL_OPINION: 881990007,
  CARBON_DATED: 881990008,
  OTHER_REASON: 881990009
};

const AlreadyCertifiedLookup = {
  YES: 881990000,
  NO: 881990001,
  USED_TO: 881990002
};

const SellingOnBehalfOfLookup = {
  BUSINESS_I_WORK_FOR: 881990000,
  AN_INDIVIDUAL: 881990001,
  ANOTHER_BUSINESS: 881990002,
  FRIEND_OR_RELATIVE: 881990003,
  A_BUSINESS: 881990004,
  OTHER: 881990005
};

const Statuses = {
  LOGGED: 881990000,
  GRANTED: 881990005,
  REFUSED: 881990006,
  REVISED_CERTIFICATE_ISSUED: 881990007,
  REPLACEMENT_CERTIFICATE_ISSUED: 881990008,
  AWAITING_FURTHER_INFORMATION_APPLICANT: 881990009,
  AWAITING_ADVICE_OTHERS: 881990010,
  REFERRED_TO_PI: 881990011,
  RE_REFERRED_TO_PI: 881990012,
  IN_APPEAL: 881990013,
  APPEAL_UNOPPOSED: 881990014,
  APPEAL_UPHELD: 881990015,
  APPEAL_UNSUCCESSFUL: 881990016,
  CHECK_COMPLETE_COMPLIANT: 881990018,
  CHECK_COMPLETE_NON_COMPLIANT: 881990019,
  UNDERGOING_CHECKS: 881990017,
  ISSUED: 881990020
};

const Section2OnlyStatuses = [
  Statuses.GRANTED,
  Statuses.REFUSED,
  Statuses.REVISED_CERTIFICATE_ISSUED,
  Statuses.REPLACEMENT_CERTIFICATE_ISSUED,
  Statuses.AWAITING_FURTHER_INFORMATION_APPLICANT,
  Statuses.AWAITING_ADVICE_OTHERS,
  Statuses.REFERRED_TO_PI,
  Statuses.RE_REFERRED_TO_PI,
  Statuses.IN_APPEAL,
  Statuses.APPEAL_UNOPPOSED,
  Statuses.APPEAL_UPHELD,
  Statuses.APPEAL_UNSUCCESSFUL,
  Statuses.ISSUED
];

const Section10OnlyStatuses = [
  Statuses.UNDERGOING_CHECKS,
  Statuses.CHECK_COMPLETE_COMPLIANT,
  Statuses.CHECK_COMPLETE_NON_COMPLIANT
];

const frontEndCertificateDownloadRoute = 'download-certificate'
const frontEndPIDownloadRoute = 'pass-data-to-pi/application-details'

this.formOnLoad = async (executionContext, section) => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const isSection2 = section === 2;

  const fieldName = isSection2 ? DataVerseFieldName.NAME : DataVerseFieldName.SUBMISSION_REFERENCE;

  const submissionReference = formContext.getAttribute(fieldName).getValue();

  if (!submissionReference) {
    this.initialiseRecord(executionContext, isSection2);
  }

  this._filterExemptionTypes(formContext, isSection2);

  this._filterSellingOnBehalfOfChoices(formContext, true);
  this._filterSellingOnBehalfOfChoices(formContext, false);

  if (!isSection2) {
    this.exemptionTypeOnChange(executionContext);
  }

  this.setStatuses(formContext, isSection2);

  this.setAgeExemptionReasons(formContext, isSection2);

  this.ivoryAgeOnChange(executionContext);

  if (isSection2) {
    this._setCertificateKey(formContext)
    await this._setCertificateLink(formContext);
    await this._setPILink(formContext);
    this.certificateDetailsOnChange(executionContext);
    this.alreadyHasCertificateOnChange(executionContext);
  }

  this._setFieldVisibilityBasedOnCurrentUserRoles(formContext);
}

this.prescribedInstituteFormOnLoad = executionContext => { 
  const formContext = executionContext.getFormContext();

  const currentUserRoles = Xrm.Utility.getGlobalContext().userSettings.roles
    .getAll()
    .map(role => role.name);

  const currentUserIsSuperuser = currentUserRoles.includes(IVORY_SUPERUSER_ROLE);
  if (!currentUserIsSuperuser) {
    this._setAllPiFieldsToReadOnly(formContext);
  }
}

this.formOnSave = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();
  const myUniqueId = '_ivoryNotificationId';

  // Display the form level notification as an INFO
  formContext.ui.setFormNotification('Record saved', 'INFO', myUniqueId);

  // Wait before clearing the notification
  window.setTimeout(() => {
    formContext.ui.clearFormNotification(myUniqueId);
  }, NOTIFICATION_TIMEOUT);
}

// Used when manually creating new records to add calculated values.
this.initialiseRecord = (executionContext, isSection2) => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const currentDate = new Date();

  const fieldName = isSection2 ? DataVerseFieldName.NAME : DataVerseFieldName.SUBMISSION_REFERENCE;

  const submissionReference = formContext.getAttribute(fieldName).getValue();

  if (!submissionReference) {
    formContext
      .getAttribute(fieldName)
      .setValue(this.generateSubmissionReference());

    formContext.getAttribute(DataVerseFieldName.SUBMISSION_DATE).setValue(currentDate);

    formContext.getAttribute(DataVerseFieldName.STATUS).setValue(Statuses.LOGGED);

    isSection2 ? 
      this.submissionStatusSection2OnChange(executionContext) :
      this.submissionStatusSection10OnChange(executionContext);

    if (isSection2) {
      const targetCompletionDate = new Date(currentDate.getTime());
      targetCompletionDate.setDate(
        currentDate.getDate() + TARGET_COMPLETION_DATE_DAYS
      );

      formContext.getAttribute(DataVerseFieldName.TARGET_COMPLETION_DATE).setValue(targetCompletionDate);
    }
  }
}

this._filterExemptionTypes = (formContext, isSection2) => {
  'use strict';

  if (!isSection2) {
    formContext.getControl(DataVerseFieldName.EXEMPTION_TYPE).removeOption(ExemptionTypeLookup.HIGH_VALUE);
  }
}

this._filterSellingOnBehalfOfChoices = (formContext, isCurrent) => {
  'use strict';

  const workForABusiness = isCurrent ? 
    formContext.getAttribute(DataVerseFieldName.WORK_FOR_A_BUSINESS).getValue() : 
    formContext.getAttribute(DataVerseFieldName.PREVIOUS_WORK_FOR_A_BUSINESS).getValue();

  const sellingOnBehalfOfControl = isCurrent ? 
    formContext.getControl(DataVerseFieldName.SELLING_ON_BEHALF_OF) : 
    formContext.getControl(DataVerseFieldName.PREVIOUS_SELLING_ON_BEHALF_OF);

  sellingOnBehalfOfControl.clearOptions();

  if (workForABusiness) {
    sellingOnBehalfOfControl.addOption({
      text: 'The business I work for',
      value: SellingOnBehalfOfLookup.BUSINESS_I_WORK_FOR
    });

    sellingOnBehalfOfControl.addOption({
      text: 'An individual',
      value: SellingOnBehalfOfLookup.AN_INDIVIDUAL
    });

    sellingOnBehalfOfControl.addOption({
      text: 'Another business',
      value: SellingOnBehalfOfLookup.ANOTHER_BUSINESS
    });

  } else {
    sellingOnBehalfOfControl.addOption({
      text: 'A friend or relative',
      value: SellingOnBehalfOfLookup.FRIEND_OR_RELATIVE
    });

    sellingOnBehalfOfControl.addOption({
      text: 'A business',
      value: SellingOnBehalfOfLookup.A_BUSINESS
    });
  }

  sellingOnBehalfOfControl.addOption({
    text: 'Other',
    value: SellingOnBehalfOfLookup.OTHER
  });
}

this._setCertificateKey = formContext => {
  'use strict';

  const certificateKey = formContext.getAttribute(DataVerseFieldName.CERTIFICATE_KEY).getValue();
  if (!certificateKey) {
    formContext.getAttribute(DataVerseFieldName.CERTIFICATE_KEY).setValue(this.generateCertificateKey());
  }
}

this._setCertificateLink = async formContext => {
  'use strict';

  const frontEndUrl = await this.getEnvironmentVariableValue('cre2c_FRONT_END_URL');
  const id = formContext.data.entity.getId().toLowerCase().replace('{', '').replace('}', '');

  const key = formContext.getAttribute(DataVerseFieldName.CERTIFICATE_KEY).getValue();
  const link = `${frontEndUrl}/${frontEndCertificateDownloadRoute}/${id}?key=${key}`;

  formContext.getAttribute(DataVerseFieldName.CERTIFICATE_LINK).setValue(link);
}

this._setPILink = async formContext => {
  'use strict';

  const frontEndUrl = await this.getEnvironmentVariableValue('cre2c_FRONT_END_URL');
  const id = formContext.data.entity.getId().toLowerCase().replace('{', '').replace('}', '');

  const key = formContext.getAttribute(DataVerseFieldName.CERTIFICATE_KEY).getValue();
  const link = `${frontEndUrl}/${frontEndPIDownloadRoute}?id=${id}&key=${key}`;

  formContext.getAttribute(DataVerseFieldName.PI_LINK).setValue(link);
}

this.submissionStatusSection2OnChange = executionContext => {
  'use strict';

  const currentDate = new Date();

  const formContext = executionContext.getFormContext();
  
  formContext.getAttribute(DataVerseFieldName.DATE_STATUS_APPLIED).setValue(new Date());

  const status = formContext.getAttribute(DataVerseFieldName.STATUS).getValue();
  
  if (status === Statuses.REFERRED_TO_PI || status === Statuses.RE_REFERRED_TO_PI) {
    const dateSentToPiAttribute = formContext.getAttribute(DataVerseFieldName.DATE_SENT_TO_PI)
    dateSentToPiAttribute.setValue(currentDate);
    dateSentToPiAttribute.fireOnChange();

    const piLinkExpiryDate = new Date(currentDate.getTime());
    piLinkExpiryDate.setDate(
      currentDate.getDate() + PI_LINK_EXPIRY_DATE_DAYS
    );

    formContext.getAttribute(DataVerseFieldName.PI_LINK_EXPIRY).setValue(piLinkExpiryDate);
  }
  
  const certificateNumber = formContext.getAttribute(DataVerseFieldName.CERTIFICATE_NUMBER).getValue();
  if (status === Statuses.ISSUED && certificateNumber === null) {
    formContext.getAttribute(DataVerseFieldName.CERTIFICATE_ISSUE_DATE).setValue(currentDate);
    formContext.getAttribute(DataVerseFieldName.CERTIFICATE_NUMBER).setValue(this.generateSubmissionReference());

    this.certificateDetailsOnChange(executionContext);

    const certificateLinkExpiryDate = new Date(currentDate.getTime());
    certificateLinkExpiryDate.setDate(
      currentDate.getDate() + CERTIFICATE_LINK_EXPIRY_DATE_DAYS
    );

    formContext.getAttribute(DataVerseFieldName.CERTIFICATE_LINK_EXPIRY).setValue(certificateLinkExpiryDate);
  }
}

this.submissionStatusSection10OnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();
  formContext.getAttribute(DataVerseFieldName.DATE_STATUS_APPLIED).setValue(new Date());
}

this.applicationSentToPiOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const dateSentToPi = formContext.getAttribute(DataVerseFieldName.DATE_SENT_TO_PI).getValue();

  if (dateSentToPi) {
    const piLinkExpiryDate = dateSentToPi;

    piLinkExpiryDate.setDate(
      piLinkExpiryDate.getDate() + PI_LINK_EXPIRY_DATE_DAYS
    );
    
    formContext.getAttribute(DataVerseFieldName.PI_LINK_EXPIRY).setValue(piLinkExpiryDate);
  }
}

// This handler is only called from the back office for Section 10 records
this.exemptionTypeOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const selectedExemptionType = formContext.getAttribute(DataVerseFieldName.EXEMPTION_TYPE).getValue();

  switch (selectedExemptionType) {
    case ExemptionTypeLookup.MUSICAL:
      formContext.getControl(DataVerseFieldName.WHY_IVORY_INTEGRAL).setVisible(false);
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).setVisible(true);
      formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT).setVisible(true);

      formContext.getAttribute(DataVerseFieldName.WHY_IVORY_INTEGRAL).setValue(null);
      break;

    case ExemptionTypeLookup.TEN_PERCENT:
      formContext.getControl(DataVerseFieldName.WHY_IVORY_INTEGRAL).setVisible(true);
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).setVisible(true);
      formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT).setVisible(true);
      break;

    case ExemptionTypeLookup.MINIATURE:
      formContext.getControl(DataVerseFieldName.WHY_IVORY_INTEGRAL).setVisible(false);
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).setVisible(true);
      formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT).setVisible(true);

      formContext.getAttribute(DataVerseFieldName.WHY_IVORY_INTEGRAL).setValue(null);
      break;

    case ExemptionTypeLookup.MUSEUM:
      formContext.getControl(DataVerseFieldName.WHY_IVORY_INTEGRAL).setVisible(false);
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).setVisible(false);
      formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT).setVisible(false);

      formContext.getAttribute(DataVerseFieldName.WHY_IVORY_INTEGRAL).setValue(null);
      formContext.getAttribute(DataVerseFieldName.WHY_AGE_EXEMPT).setValue(null);
      formContext.getAttribute(DataVerseFieldName.WHY_IVORY_EXEMPT).setValue(null);
      break;

    default:
      formContext.getControl(DataVerseFieldName.WHY_IVORY_INTEGRAL).setVisible(false);
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).setVisible(false);
      formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT).setVisible(false);

      formContext.getAttribute(DataVerseFieldName.WHY_IVORY_INTEGRAL).setValue(null);
      formContext.getAttribute(DataVerseFieldName.WHY_AGE_EXEMPT).setValue(null);
      formContext.getAttribute(DataVerseFieldName.WHY_IVORY_EXEMPT).setValue(null);
  }

  this.setAgeExemptionReasons(formContext, false);

  this.ivoryAgeOnChange(executionContext);
}

this.ivoryAgeOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const selectedIvoryAgeReasons = formContext.getAttribute(DataVerseFieldName.WHY_AGE_EXEMPT).getValue();

  if (Array.isArray(selectedIvoryAgeReasons) && selectedIvoryAgeReasons.includes(AgeExemptionReasonLookup.OTHER_REASON)) {
    formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setVisible(true);
  } else {
    formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setVisible(false);
    formContext.getAttribute(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setValue(null);
  }
}

this.certificateDetailsOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();
  const certificateNumber = formContext.getAttribute(DataVerseFieldName.CERTIFICATE_NUMBER).getValue();
  const certificateIssueDate = formContext.getAttribute(DataVerseFieldName.CERTIFICATE_ISSUE_DATE).getValue();
  formContext.getControl(DataVerseFieldName.CERTIFICATE_LINK).setVisible(certificateNumber !== null && certificateIssueDate !== null);
}

this.alreadyHasCertificateOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const alreadyHasCertificate = formContext.getAttribute(DataVerseFieldName.ALREADY_HAS_CERTIFICATE).getValue();

  switch (alreadyHasCertificate) {
    case AlreadyCertifiedLookup.YES:
      formContext.getControl(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setVisible(false);
      formContext.getControl(DataVerseFieldName.APPLIED_BEFORE).setVisible(false);
      formContext.getControl(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setVisible(false);

      formContext.getAttribute(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setValue(null);
      formContext.getAttribute(DataVerseFieldName.APPLIED_BEFORE).setValue(null);
      formContext.getAttribute(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setValue(null);
      break;

    case AlreadyCertifiedLookup.NO:
      formContext.getControl(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setVisible(false);
      formContext.getControl(DataVerseFieldName.APPLIED_BEFORE).setVisible(true);
      formContext.getControl(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setVisible(false);

      formContext.getAttribute(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setValue(null);

      this.appliedBeforeOnChange(executionContext);
      break;

    case AlreadyCertifiedLookup.USED_TO:
      formContext.getControl(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setVisible(true);
      formContext.getControl(DataVerseFieldName.APPLIED_BEFORE).setVisible(false);
      formContext.getControl(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setVisible(false);

      formContext.getAttribute(DataVerseFieldName.APPLIED_BEFORE).setValue(null);
      formContext.getAttribute(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setValue(null);
      break;

    default:
      formContext.getControl(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setVisible(false);
      formContext.getControl(DataVerseFieldName.APPLIED_BEFORE).setVisible(false);
      formContext.getControl(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setVisible(false);

      formContext.getAttribute(DataVerseFieldName.REVOKED_CERTIFICATE_NUMBER).setValue(null);
      formContext.getAttribute(DataVerseFieldName.APPLIED_BEFORE).setValue(null);
      formContext.getAttribute(DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER).setValue(null);
      break;
  }
}

this.appliedBeforeOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const appliedBefore = formContext.getControl(DataVerseFieldName.APPLIED_BEFORE);

  const hasAppliedBefore = appliedBefore.getValue() === 'Yes';

  const fieldName = DataVerseFieldName.PREVIOUS_APPLICATION_NUMBER
  formContext.getControl(fieldName).setVisible(hasAppliedBefore);
  if (!hasAppliedBefore) {
    formContext.getAttribute(fieldName).setValue(null);
  }
}

this.workForABusinessOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();
  this._filterSellingOnBehalfOfChoices(formContext, true);
}

this.previousWorkForABusinessOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();
  this._filterSellingOnBehalfOfChoices(formContext, false);
}

this.setStatuses = (formContext, isSection2) => {
  'use strict';

  const statusControl = formContext.getControl(DataVerseFieldName.STATUS);
  if (isSection2) {
    Section10OnlyStatuses.forEach(status => statusControl.removeOption(status));
  } else {
    Section2OnlyStatuses.forEach(status => statusControl.removeOption(status));
  }
}

this.setAgeExemptionReasons = (formContext, isSection2) => {
  'use strict';

  const fieldName = isSection2 ? DataVerseFieldName.EXEMPTION_CATEGORY : DataVerseFieldName.EXEMPTION_TYPE;
  const selectedExemptionType = formContext.getAttribute(fieldName).getValue();

  const whyAgeExemptControl = formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT);
  whyAgeExemptControl.removeOption(AgeExemptionReasonLookup.BEEN_IN_FAMILY_1975);
  whyAgeExemptControl.removeOption(AgeExemptionReasonLookup.BEEN_IN_FAMILY_1947);
  whyAgeExemptControl.removeOption(AgeExemptionReasonLookup.BEEN_IN_FAMILY_1918);

  switch (selectedExemptionType) {
    case ExemptionTypeLookup.MUSICAL:
      whyAgeExemptControl.addOption({
        text: 'It’s been in the family since before 1975',
        value: AgeExemptionReasonLookup.BEEN_IN_FAMILY_1975
      }, 3);
      break;

    case ExemptionTypeLookup.TEN_PERCENT:
      whyAgeExemptControl.addOption({
        text: 'It’s been in the family since before 3 March 1947',
        value: AgeExemptionReasonLookup.BEEN_IN_FAMILY_1947
      }, 3);
      break;

    case ExemptionTypeLookup.MINIATURE:
    case ExemptionTypeLookup.HIGH_VALUE:
      whyAgeExemptControl.addOption({
        text: 'It’s been in the family since before 1918',
        value: AgeExemptionReasonLookup.BEEN_IN_FAMILY_1918
      }, 3);
      break;

    case ExemptionTypeLookup.MUSEUM:
      break;

    default:
  }
}

this.getEnvironmentVariableValue = async schemaName => {
  'use strict';

  const response = await Xrm.WebApi.retrieveMultipleRecords(
      'environmentvariabledefinition',
      [
          "?$select=defaultvalue",
          "&$filter=schemaname eq '", schemaName, "'",
          "&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)"
      ].join('')
  );

  let value = null;

  if (response.entities.length === 1) {
      if (response.entities[0].environmentvariabledefinition_environmentvariablevalue.length === 1) {
          value = response.entities[0].environmentvariabledefinition_environmentvariablevalue[0].value;
      }
      else {
          value = response.entities[0].defaultvalue;
      }
  }

  return value;
}

this._setFieldVisibilityBasedOnCurrentUserRoles = async (formContext) => {
  const currentUserRoles = Xrm.Utility.getGlobalContext().userSettings.roles
    .getAll()
    .map(role => role.name);

  const isManuallyCreated = formContext.getAttribute(DataVerseFieldName.MANUALLY_CREATED).getValue();

  const currentUserIsSuperuser = currentUserRoles.includes(IVORY_SUPERUSER_ROLE);
  if (!isManuallyCreated && !currentUserIsSuperuser) {
    this._setAllFieldsToReadOnly(formContext);
  }

  const paymentReferenceControl = formContext.getControl(DataVerseFieldName.PAYMENT_REFERENCE);
  paymentReferenceControl.setDisabled(!isManuallyCreated);
}

this._setAllFieldsToReadOnly = async (formContext) => {
  const formControls = formContext.getControl();

  const alwaysEditableControls = [
    DataVerseFieldName.ASSESSMENT_SUMMARY,
    DataVerseFieldName.ASSESSMENT_SUPPORTING_EVIDENCE,
    DataVerseFieldName.CERTIFICATE_ISSUE_DATE,
    DataVerseFieldName.CERTIFICATE_LINK_EXPIRY,
    DataVerseFieldName.CERTIFICATE_NUMBER,
    DataVerseFieldName.CERTIFICATE,
    DataVerseFieldName.DATE_COI_SENT_TO_PI,
    DataVerseFieldName.DATE_DETAILS_SENT_TO_PI,
    DataVerseFieldName.DATE_OF_PI_RESPONSE,
    DataVerseFieldName.DATE_RECOMMENDATION_RECEIVED,
    DataVerseFieldName.DATE_SENT_TO_PI,
    DataVerseFieldName.MANUALLY_CREATED,
    DataVerseFieldName.OWNER,
    DataVerseFieldName.PI_ASSIGNMENT_NOTES,
    DataVerseFieldName.PI_LINK_EXPIRY,
    DataVerseFieldName.PRESCRIBED_INSTITUTE,
    DataVerseFieldName.STATE_CODE,
    DataVerseFieldName.STATUS,
    DataVerseFieldName.TARGET_COMPLETION_DATE
  ];

  formControls.forEach(control => {
    if (!alwaysEditableControls.includes(control.name)) {
      control.setDisabled(true);
    }
  });
}

this._setAllPiFieldsToReadOnly = formContext => {
  const formControls = formContext.getControl();

  formControls.forEach(control => {
    control.setDisabled(true);
  });
}

// Generates a random submission reference in the same format as that which is generated by the front end.
// Used when manually adding new records.
this.generateSubmissionReference = () => {
  'use strict';

  return Math.random()
    .toString(36)
    .substr(2, 8)
    .toUpperCase();
}

// Generates a random 129 character long certificate key
this.generateCertificateKey = () => {
  'use strict';

  let key = '';
  for (let i = 0; i < 12; i++) {
    key += Math.random()
    .toString(36)
    .substr(2, 15);
  }

  return key;
}

// Used when necessary for debugging purposes
this.showAlert = message => {
  'use strict';

//  const currentUserName = Xrm.Utility.getGlobalContext().userSettings.userName
//  const message = 'Hello ' + currentUserName;
//  Xrm.Navigation.openAlertDialog({ text: message});

  Xrm.Navigation.openAlertDialog({ text: message });
}
