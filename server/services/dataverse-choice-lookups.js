const {
  AgeExemptionReasons,
  ItemType,
  Intention,
  IvoryIntegralReasons,
  IvoryVolumeReasons
} = require('../utils/constants')

const AgeExemptionReasonLookup = {
  [AgeExemptionReasons.STAMP_OR_SERIAL]: 881990000,
  [AgeExemptionReasons.DATED_RECEIPT]: 881990001,
  [AgeExemptionReasons.DATED_PUBLICATION]: 881990002,
  [AgeExemptionReasons.BEEN_IN_FAMILY_1975]: 881990003,
  [AgeExemptionReasons.BEEN_IN_FAMILY_1947]: 881990004,
  [AgeExemptionReasons.BEEN_IN_FAMILY_1918]: 881990005,
  [AgeExemptionReasons.EXPERT_VERIFICATION]: 881990006,
  [AgeExemptionReasons.PROFESSIONAL_OPINION]: 881990007,
  [AgeExemptionReasons.CARBON_DATED]: 881990008,
  [AgeExemptionReasons.OTHER_REASON]: 881990009
}

const ExemptionTypeLookup = {
  [ItemType.MUSICAL]: 881990000,
  [ItemType.TEN_PERCENT]: 881990001,
  [ItemType.MINIATURE]: 881990002,
  [ItemType.MUSEUM]: 881990003,
  [ItemType.HIGH_VALUE]: 881990004
}

const IntentionLookup = {
  [Intention.SELL]: 881990000,
  [Intention.HIRE]: 881990001,
  [Intention.NOT_SURE_YET]: 881990002
}

const IvoryIntegralLookup = {
  [IvoryIntegralReasons.ESSENTIAL_TO_DESIGN_OR_FUNCTION]: 881990000,
  [IvoryIntegralReasons.CANNOT_EASILY_REMOVE]: 881990001,
  [IvoryIntegralReasons.BOTH_OF_ABOVE]: 881990002
}

const IvoryVolumeLookup = {
  [IvoryVolumeReasons.CLEAR_FROM_LOOKING_AT_IT]: 881990000,
  [IvoryVolumeReasons.MEASURED_IT]: 881990001,
  [IvoryVolumeReasons.WRITTEN_VERIFICATION]: 881990002,
  [IvoryVolumeReasons.OTHER_REASON]: 881990003
}

const Status = {
  New: 881990000,
  InProgress: 881990001,
  RequestedMoreInformation: 881990002,
  SentToInstitute: 881990003,
  Certified: 881990004,
  Rejected: 881990005
}

const WhyIvoryIntegral = {
  NotApplicable: 881990000,
  EssentialToDesignOrFunction: 881990001,
  CannotRemoveEasily: 881990002,
  Both: 881990003
}

module.exports = {
  AgeExemptionReasonLookup,
  ExemptionTypeLookup,
  IntentionLookup,
  IvoryIntegralLookup,
  IvoryVolumeLookup,
  Status,
  WhyIvoryIntegral
}
