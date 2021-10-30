const {
  AgeExemptionReasons,
  BehalfOfBusinessOptions,
  BehalfOfNotBusinessOptions,
  Capacities,
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

const CapacityLookup = {
  [Capacities.AGENT]: 881990000,
  [Capacities.EXECUTOR_ADMINISTRATOR]: 881990001,
  [Capacities.TRUSTEE]: 881990002,
  [Capacities.OTHER]: 881990003
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

const SellingOnBehalfOfLookup = {
  [BehalfOfBusinessOptions.BUSINESS_I_WORK_FOR]: 881990000,
  [BehalfOfBusinessOptions.AN_INDIVIDUAL]: 881990001,
  [BehalfOfBusinessOptions.ANOTHER_BUSINESS]: 881990002,
  [BehalfOfNotBusinessOptions.FRIEND_OR_RELATIVE]: 881990003,
  [BehalfOfNotBusinessOptions.A_BUSINESS]: 881990004,
  [BehalfOfBusinessOptions.OTHER]: 881990005
}

const Status = {
  Logged: 881990000
}

const WhyIvoryIntegral = {
  NotApplicable: 881990000,
  EssentialToDesignOrFunction: 881990001,
  CannotRemoveEasily: 881990002,
  Both: 881990003
}

module.exports = {
  AgeExemptionReasonLookup,
  CapacityLookup,
  ExemptionTypeLookup,
  IntentionLookup,
  IvoryIntegralLookup,
  IvoryVolumeLookup,
  SellingOnBehalfOfLookup,
  Status,
  WhyIvoryIntegral
}
