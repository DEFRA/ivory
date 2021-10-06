const NOTIFICATION_TIMEOUT = 5000;
const LOGGED_STATUS = 881990000;
const TARGET_COMPLETION_DATE_DAYS = 30;

const DataVerseFieldName = {
  SECTION_2_CASE_ID: 'cre2c_ivorysection2caseid',
  SECTION_10_CASE_ID: 'cre2c_ivorysection10caseid',
  TARGET_COMPLETION_DATE: 'cre2c_targetcompletiondate',
  NAME: 'cre2c_name',
  EXEMPTION_CATEGORY: 'cre2c_exemptioncategory',
  WHERE_IT_WAS_MADE: 'cre2c_whereitwasmade',
  WHEN_IT_WAS_MADE: 'cre2c_whenitwasmade',
  WHY_OUTSTANDINLY_VALUABLE: 'cre2c_whyoutstandinglyvaluable',
  SUBMISSION_REFERENCE: 'cre2c_submissionreference',
  EXEMPTION_TYPE: 'cre2c_exemptiontype',
  WHY_IVORY_EXEMPT: 'cre2c_whyivoryexempt',
  WHY_IVORY_EXEMPT_OTHER_REASON: 'cre2c_whyivoryexemptotherreason',
  WHY_IVORY_INTEGRAL: 'cre2c_whyivoryintegral',
  DATE_STATUS_APPLIED: 'cre2c_datestatusapplied',
  STATUS: 'cre2c_status',
  SUBMISSION_DATE: 'cre2c_submissiondate',
  PAYMENT_REFERENCE: 'cre2c_paymentreference',
  WHY_AGE_EXEMPT: 'cre2c_whyageexempt',
  WHY_AGE_EXEMPT_OTHER_REASON: 'cre2c_whyageexemptotherreason',
  WHERE_IS_THE_IVORY: 'cre2c_wherestheivory',
  ITEM_SUMMARY: 'cre2c_itemsummary',
  UNIQUE_FEATURES: 'cre2c_uniquefeatures',
  INTENTION: 'cre2c_intention',
  OWNER_NAME: 'cre2c_ownername',
  OWNER_EMAIL: 'cre2c_owneremail',
  OWNER_ADDRESS: 'cre2c_owneraddress',
  APPLICANT_NAME: 'cre2c_applicantname',
  APPLICANT_EMAIL: 'cre2c_applicantemail',
  APPLICANT_ADDRESS: 'cre2c_applicantaddress',
  PHOTO_1: 'cre2c_photo1',
  SUPPORTING_EVIDENCE_1: 'cre2c_supportingevidence1',
  SUPPORTING_EVIDENCE_1_NAME: 'cre2c_supportingevidence1_name'
};

const ExemptionTypeLookup = {
  MUSICAL: 881990000,
  TEN_PERCENT: 881990001,
  MINIATURE: 881990002,
  MUSEUM: 881990003,
  HIGH_VALUE: 881990004
}

const IvoryVolumeLookup = {
  CLEAR_FROM_LOOKING_AT_IT: 881990000,
  MEASURED_IT: 881990001,
  WRITTEN_VERIFICATION: 881990002,
  OTHER_REASON: 881990003
}

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
}

this.formOnLoad = (executionContext, section) => {
  'use strict';

  const formContext = executionContext.getFormContext();

  const isSection2 = section === 2;

  const fieldName = isSection2 ? DataVerseFieldName.NAME : DataVerseFieldName.SUBMISSION_REFERENCE;

  const submissionReference = formContext.getAttribute(fieldName).getValue();

  if (!submissionReference) {
    this.initialiseRecord(formContext, isSection2);
  }

  if (!isSection2) {
    formContext.getControl(DataVerseFieldName.EXEMPTION_TYPE).removeOption(ExemptionTypeLookup.HIGH_VALUE);
  }

  if (!isSection2) {
    this.exemptionTypeOnChange(executionContext);
    this.ivoryVolumeOnChange(executionContext);
  }

  this.setAgeExemptionReasons(formContext, isSection2);

  this.ivoryAgeOnChange(executionContext);
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

this.submissionStatusOnChange = executionContext => {
  'use strict';

  const formContext = executionContext.getFormContext();
  formContext.getAttribute(DataVerseFieldName.DATE_STATUS_APPLIED).setValue(new Date());
}

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
      // formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).setVisible(false);
      // formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setVisible(false);
      // formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT).setVisible(false);
      // formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON).setVisible(false);
  }

  this.setAgeExemptionReasons(formContext, false);

  this.ivoryVolumeOnChange(executionContext);
  this.ivoryAgeOnChange(executionContext);
}

this.ivoryVolumeOnChange = executionContext => {
  const formContext = executionContext.getFormContext();

  const selectedIvoryVolumeReason = formContext.getAttribute(DataVerseFieldName.WHY_IVORY_EXEMPT).getValue();
  if (selectedIvoryVolumeReason === IvoryVolumeLookup.OTHER_REASON) {
    formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON).setVisible(true);
  } else {
    formContext.getControl(DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON).setVisible(false);
    formContext.getAttribute(DataVerseFieldName.WHY_IVORY_EXEMPT_OTHER_REASON).setValue(null);
  }
}

this.ivoryAgeOnChange = executionContext => {
  const formContext = executionContext.getFormContext();

  const selectedIvoryAgeReasons = formContext.getAttribute(DataVerseFieldName.WHY_AGE_EXEMPT).getValue();

  if (Array.isArray(selectedIvoryAgeReasons) && selectedIvoryAgeReasons.includes(AgeExemptionReasonLookup.OTHER_REASON)) {
    formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setVisible(true);
  } else {
    formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setVisible(false);
    formContext.getAttribute(DataVerseFieldName.WHY_AGE_EXEMPT_OTHER_REASON).setValue(null);
  }
}

this.initialiseRecord = (formContext, isSection2) => {
  'use strict';

  const currentDate = new Date();

  const fieldName = isSection2 ? DataVerseFieldName.NAME : DataVerseFieldName.SUBMISSION_REFERENCE;

  const submissionReference = formContext.getAttribute(fieldName).getValue();

  if (!submissionReference) {
    formContext
      .getAttribute(fieldName)
      .setValue(this.generateSubmissionReference());

    formContext.getAttribute(DataVerseFieldName.SUBMISSION_DATE).setValue(currentDate);

    formContext.getAttribute(DataVerseFieldName.STATUS).setValue(LOGGED_STATUS);

    this.updateStatusAppliedDate(formContext);

    formContext.getControl(DataVerseFieldName.PAYMENT_REFERENCE).setDisabled(false);

    if (isSection2) {
      const targetCompletionDate = new Date(currentDate.getTime());
      targetCompletionDate.setDate(
        currentDate.getDate() + TARGET_COMPLETION_DATE_DAYS
      );

      formContext
        .getAttribute(DataVerseFieldName.TARGET_COMPLETION_DATE)
        .setValue(targetCompletionDate);
    }
  }
}

this.setAgeExemptionReasons = (formContext, isSection2) => {
  const fieldName = isSection2 ? DataVerseFieldName.EXEMPTION_CATEGORY : DataVerseFieldName.EXEMPTION_TYPE;
  const selectedExemptionType = formContext.getAttribute(fieldName).getValue();

  formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).removeOption(AgeExemptionReasonLookup.BEEN_IN_FAMILY_1975);
  formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).removeOption(AgeExemptionReasonLookup.BEEN_IN_FAMILY_1947);
  formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).removeOption(AgeExemptionReasonLookup.BEEN_IN_FAMILY_1918);

  switch (selectedExemptionType) {
    case ExemptionTypeLookup.MUSICAL:
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).addOption({
        text: 'It’s been in the family since before 1975',
        value: AgeExemptionReasonLookup.BEEN_IN_FAMILY_1975
      }, 3);
      break;

    case ExemptionTypeLookup.TEN_PERCENT:
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).addOption({
        text: 'It’s been in the family since before 3 March 1947',
        value: AgeExemptionReasonLookup.BEEN_IN_FAMILY_1947
      }, 3);
      break;

    case ExemptionTypeLookup.MINIATURE:
    case ExemptionTypeLookup.HIGH_VALUE:
      formContext.getControl(DataVerseFieldName.WHY_AGE_EXEMPT).addOption({
        text: 'It’s been in the family since before 1918',
        value: AgeExemptionReasonLookup.BEEN_IN_FAMILY_1918
      }, 3);
      break;

    case ExemptionTypeLookup.MUSEUM:
      break;

    default:
  }
}

this.generateSubmissionReference = () => {
  'use strict';

  return Math.random()
    .toString(36)
    .substr(2, 8)
    .toUpperCase();
}

// TODO remove this //////////////////////////////////////////////////////////////////////////

// const currentUserName = Xrm.Utility.getGlobalContext().userSettings.userName

//  const message = currentUserName + ": Your record has loaded!";

// Display an alert dialog
// Xrm.Navigation.openAlertDialog({ text: "Record saved." });

// const formContext = executionContext.getFormContext();

// display the form level notification as an INFO
// formContext.ui.setFormNotification(message, "INFO", myUniqueId);

// Wait before clearing the notification
// window.setTimeout(() => { formContext.ui.clearFormNotification(myUniqueId); }, NOTIFICATION_TIMEOUT);

// Xrm.Navigation.openAlertDialog({ text: Date.now()});

// const val1=formContext.getAttribute("cre2c_datestatusapplied").getValue();
// Xrm.Navigation.openAlertDialog({ text: val1 });
