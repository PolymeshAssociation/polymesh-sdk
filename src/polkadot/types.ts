// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

export * from './polymesh/types';
export * from './compliance/types';
export * from './identity/types';
export * from './pips/types';
export * from './protocolFee/types';
export * from './staking/types';
export * from './asset/types';

export enum SystemTx {
  FillBlock = 'system.fillBlock',
  Remark = 'system.remark',
  SetHeapPages = 'system.setHeapPages',
  SetCode = 'system.setCode',
  SetCodeWithoutChecks = 'system.setCodeWithoutChecks',
  SetChangesTrieConfig = 'system.setChangesTrieConfig',
  SetStorage = 'system.setStorage',
  KillStorage = 'system.killStorage',
  KillPrefix = 'system.killPrefix',
}

export enum BabeTx {
  ReportEquivocation = 'babe.reportEquivocation',
  ReportEquivocationUnsigned = 'babe.reportEquivocationUnsigned',
}

export enum TimestampTx {
  Set = 'timestamp.set',
}

export enum IndicesTx {
  Claim = 'indices.claim',
  Transfer = 'indices.transfer',
  Free = 'indices.free',
  ForceTransfer = 'indices.forceTransfer',
  Freeze = 'indices.freeze',
}

export enum AuthorshipTx {
  SetUncles = 'authorship.setUncles',
}

export enum BalancesTx {
  Transfer = 'balances.transfer',
  TransferWithMemo = 'balances.transferWithMemo',
  DepositBlockRewardReserveBalance = 'balances.depositBlockRewardReserveBalance',
  SetBalance = 'balances.setBalance',
  ForceTransfer = 'balances.forceTransfer',
  BurnAccountBalance = 'balances.burnAccountBalance',
}

export enum IdentityTx {
  CddRegisterDid = 'identity.cddRegisterDid',
  InvalidateCddClaims = 'identity.invalidateCddClaims',
  RemoveSecondaryKeys = 'identity.removeSecondaryKeys',
  AcceptPrimaryKey = 'identity.acceptPrimaryKey',
  ChangeCddRequirementForMkRotation = 'identity.changeCddRequirementForMkRotation',
  JoinIdentityAsKey = 'identity.joinIdentityAsKey',
  LeaveIdentityAsKey = 'identity.leaveIdentityAsKey',
  AddClaim = 'identity.addClaim',
  RevokeClaim = 'identity.revokeClaim',
  SetPermissionToSigner = 'identity.setPermissionToSigner',
  LegacySetPermissionToSigner = 'identity.legacySetPermissionToSigner',
  FreezeSecondaryKeys = 'identity.freezeSecondaryKeys',
  UnfreezeSecondaryKeys = 'identity.unfreezeSecondaryKeys',
  AddAuthorization = 'identity.addAuthorization',
  RemoveAuthorization = 'identity.removeAuthorization',
  AddSecondaryKeysWithAuthorization = 'identity.addSecondaryKeysWithAuthorization',
  AddInvestorUniquenessClaim = 'identity.addInvestorUniquenessClaim',
  GcAddCddClaim = 'identity.gcAddCddClaim',
  GcRevokeCddClaim = 'identity.gcRevokeCddClaim',
  AddInvestorUniquenessClaimV2 = 'identity.addInvestorUniquenessClaimV2',
  RevokeClaimByIndex = 'identity.revokeClaimByIndex',
  RotatePrimaryKeyToSecondary = 'identity.rotatePrimaryKeyToSecondary',
}

export enum CddServiceProvidersTx {
  SetActiveMembersLimit = 'cddServiceProviders.setActiveMembersLimit',
  DisableMember = 'cddServiceProviders.disableMember',
  AddMember = 'cddServiceProviders.addMember',
  RemoveMember = 'cddServiceProviders.removeMember',
  SwapMember = 'cddServiceProviders.swapMember',
  ResetMembers = 'cddServiceProviders.resetMembers',
  AbdicateMembership = 'cddServiceProviders.abdicateMembership',
}

export enum PolymeshCommitteeTx {
  SetVoteThreshold = 'polymeshCommittee.setVoteThreshold',
  SetReleaseCoordinator = 'polymeshCommittee.setReleaseCoordinator',
  SetExpiresAfter = 'polymeshCommittee.setExpiresAfter',
  VoteOrPropose = 'polymeshCommittee.voteOrPropose',
  Vote = 'polymeshCommittee.vote',
}

export enum CommitteeMembershipTx {
  SetActiveMembersLimit = 'committeeMembership.setActiveMembersLimit',
  DisableMember = 'committeeMembership.disableMember',
  AddMember = 'committeeMembership.addMember',
  RemoveMember = 'committeeMembership.removeMember',
  SwapMember = 'committeeMembership.swapMember',
  ResetMembers = 'committeeMembership.resetMembers',
  AbdicateMembership = 'committeeMembership.abdicateMembership',
}

export enum TechnicalCommitteeTx {
  SetVoteThreshold = 'technicalCommittee.setVoteThreshold',
  SetReleaseCoordinator = 'technicalCommittee.setReleaseCoordinator',
  SetExpiresAfter = 'technicalCommittee.setExpiresAfter',
  VoteOrPropose = 'technicalCommittee.voteOrPropose',
  Vote = 'technicalCommittee.vote',
}

export enum TechnicalCommitteeMembershipTx {
  SetActiveMembersLimit = 'technicalCommitteeMembership.setActiveMembersLimit',
  DisableMember = 'technicalCommitteeMembership.disableMember',
  AddMember = 'technicalCommitteeMembership.addMember',
  RemoveMember = 'technicalCommitteeMembership.removeMember',
  SwapMember = 'technicalCommitteeMembership.swapMember',
  ResetMembers = 'technicalCommitteeMembership.resetMembers',
  AbdicateMembership = 'technicalCommitteeMembership.abdicateMembership',
}

export enum UpgradeCommitteeTx {
  SetVoteThreshold = 'upgradeCommittee.setVoteThreshold',
  SetReleaseCoordinator = 'upgradeCommittee.setReleaseCoordinator',
  SetExpiresAfter = 'upgradeCommittee.setExpiresAfter',
  VoteOrPropose = 'upgradeCommittee.voteOrPropose',
  Vote = 'upgradeCommittee.vote',
}

export enum UpgradeCommitteeMembershipTx {
  SetActiveMembersLimit = 'upgradeCommitteeMembership.setActiveMembersLimit',
  DisableMember = 'upgradeCommitteeMembership.disableMember',
  AddMember = 'upgradeCommitteeMembership.addMember',
  RemoveMember = 'upgradeCommitteeMembership.removeMember',
  SwapMember = 'upgradeCommitteeMembership.swapMember',
  ResetMembers = 'upgradeCommitteeMembership.resetMembers',
  AbdicateMembership = 'upgradeCommitteeMembership.abdicateMembership',
}

export enum MultiSigTx {
  CreateMultisig = 'multiSig.createMultisig',
  CreateOrApproveProposalAsIdentity = 'multiSig.createOrApproveProposalAsIdentity',
  CreateOrApproveProposalAsKey = 'multiSig.createOrApproveProposalAsKey',
  CreateProposalAsIdentity = 'multiSig.createProposalAsIdentity',
  CreateProposalAsKey = 'multiSig.createProposalAsKey',
  ApproveAsIdentity = 'multiSig.approveAsIdentity',
  ApproveAsKey = 'multiSig.approveAsKey',
  RejectAsIdentity = 'multiSig.rejectAsIdentity',
  RejectAsKey = 'multiSig.rejectAsKey',
  AcceptMultisigSignerAsIdentity = 'multiSig.acceptMultisigSignerAsIdentity',
  AcceptMultisigSignerAsKey = 'multiSig.acceptMultisigSignerAsKey',
  AddMultisigSigner = 'multiSig.addMultisigSigner',
  RemoveMultisigSigner = 'multiSig.removeMultisigSigner',
  AddMultisigSignersViaCreator = 'multiSig.addMultisigSignersViaCreator',
  RemoveMultisigSignersViaCreator = 'multiSig.removeMultisigSignersViaCreator',
  ChangeSigsRequired = 'multiSig.changeSigsRequired',
  MakeMultisigSigner = 'multiSig.makeMultisigSigner',
  MakeMultisigPrimary = 'multiSig.makeMultisigPrimary',
  ExecuteScheduledProposal = 'multiSig.executeScheduledProposal',
}

export enum BridgeTx {
  ChangeController = 'bridge.changeController',
  ChangeAdmin = 'bridge.changeAdmin',
  ChangeTimelock = 'bridge.changeTimelock',
  Freeze = 'bridge.freeze',
  Unfreeze = 'bridge.unfreeze',
  ChangeBridgeLimit = 'bridge.changeBridgeLimit',
  ChangeBridgeExempted = 'bridge.changeBridgeExempted',
  ForceHandleBridgeTx = 'bridge.forceHandleBridgeTx',
  BatchProposeBridgeTx = 'bridge.batchProposeBridgeTx',
  ProposeBridgeTx = 'bridge.proposeBridgeTx',
  HandleBridgeTx = 'bridge.handleBridgeTx',
  FreezeTxs = 'bridge.freezeTxs',
  UnfreezeTxs = 'bridge.unfreezeTxs',
  HandleScheduledBridgeTx = 'bridge.handleScheduledBridgeTx',
  AddFreezeAdmin = 'bridge.addFreezeAdmin',
  RemoveFreezeAdmin = 'bridge.removeFreezeAdmin',
  RemoveTxs = 'bridge.removeTxs',
}

export enum StakingTx {
  Bond = 'staking.bond',
  BondExtra = 'staking.bondExtra',
  Unbond = 'staking.unbond',
  WithdrawUnbonded = 'staking.withdrawUnbonded',
  Validate = 'staking.validate',
  Nominate = 'staking.nominate',
  Chill = 'staking.chill',
  SetPayee = 'staking.setPayee',
  SetController = 'staking.setController',
  SetValidatorCount = 'staking.setValidatorCount',
  IncreaseValidatorCount = 'staking.increaseValidatorCount',
  ScaleValidatorCount = 'staking.scaleValidatorCount',
  AddPermissionedValidator = 'staking.addPermissionedValidator',
  RemovePermissionedValidator = 'staking.removePermissionedValidator',
  ValidateCddExpiryNominators = 'staking.validateCddExpiryNominators',
  SetCommissionCap = 'staking.setCommissionCap',
  SetMinBondThreshold = 'staking.setMinBondThreshold',
  ForceNoEras = 'staking.forceNoEras',
  ForceNewEra = 'staking.forceNewEra',
  SetInvulnerables = 'staking.setInvulnerables',
  ForceUnstake = 'staking.forceUnstake',
  ForceNewEraAlways = 'staking.forceNewEraAlways',
  CancelDeferredSlash = 'staking.cancelDeferredSlash',
  PayoutStakers = 'staking.payoutStakers',
  Rebond = 'staking.rebond',
  SetHistoryDepth = 'staking.setHistoryDepth',
  ReapStash = 'staking.reapStash',
  SubmitElectionSolution = 'staking.submitElectionSolution',
  SubmitElectionSolutionUnsigned = 'staking.submitElectionSolutionUnsigned',
  PayoutStakersBySystem = 'staking.payoutStakersBySystem',
  ChangeSlashingAllowedFor = 'staking.changeSlashingAllowedFor',
  UpdatePermissionedValidatorIntendedCount = 'staking.updatePermissionedValidatorIntendedCount',
}

export enum SessionTx {
  SetKeys = 'session.setKeys',
  PurgeKeys = 'session.purgeKeys',
}

export enum GrandpaTx {
  ReportEquivocation = 'grandpa.reportEquivocation',
  ReportEquivocationUnsigned = 'grandpa.reportEquivocationUnsigned',
  NoteStalled = 'grandpa.noteStalled',
}

export enum ImOnlineTx {
  Heartbeat = 'imOnline.heartbeat',
}

export enum SudoTx {
  Sudo = 'sudo.sudo',
  SudoUncheckedWeight = 'sudo.sudoUncheckedWeight',
  SetKey = 'sudo.setKey',
  SudoAs = 'sudo.sudoAs',
}

export enum AssetTx {
  RegisterTicker = 'asset.registerTicker',
  AcceptTickerTransfer = 'asset.acceptTickerTransfer',
  AcceptAssetOwnershipTransfer = 'asset.acceptAssetOwnershipTransfer',
  CreateAsset = 'asset.createAsset',
  Freeze = 'asset.freeze',
  Unfreeze = 'asset.unfreeze',
  RenameAsset = 'asset.renameAsset',
  Issue = 'asset.issue',
  Redeem = 'asset.redeem',
  MakeDivisible = 'asset.makeDivisible',
  AddDocuments = 'asset.addDocuments',
  RemoveDocuments = 'asset.removeDocuments',
  SetFundingRound = 'asset.setFundingRound',
  UpdateIdentifiers = 'asset.updateIdentifiers',
  ClaimClassicTicker = 'asset.claimClassicTicker',
  ReserveClassicTicker = 'asset.reserveClassicTicker',
  ControllerTransfer = 'asset.controllerTransfer',
  RegisterCustomAssetType = 'asset.registerCustomAssetType',
}

export enum CapitalDistributionTx {
  Distribute = 'capitalDistribution.distribute',
  Claim = 'capitalDistribution.claim',
  PushBenefit = 'capitalDistribution.pushBenefit',
  Reclaim = 'capitalDistribution.reclaim',
  RemoveDistribution = 'capitalDistribution.removeDistribution',
}

export enum CheckpointTx {
  CreateCheckpoint = 'checkpoint.createCheckpoint',
  SetSchedulesMaxComplexity = 'checkpoint.setSchedulesMaxComplexity',
  CreateSchedule = 'checkpoint.createSchedule',
  RemoveSchedule = 'checkpoint.removeSchedule',
}

export enum ComplianceManagerTx {
  AddComplianceRequirement = 'complianceManager.addComplianceRequirement',
  RemoveComplianceRequirement = 'complianceManager.removeComplianceRequirement',
  ReplaceAssetCompliance = 'complianceManager.replaceAssetCompliance',
  ResetAssetCompliance = 'complianceManager.resetAssetCompliance',
  PauseAssetCompliance = 'complianceManager.pauseAssetCompliance',
  ResumeAssetCompliance = 'complianceManager.resumeAssetCompliance',
  AddDefaultTrustedClaimIssuer = 'complianceManager.addDefaultTrustedClaimIssuer',
  RemoveDefaultTrustedClaimIssuer = 'complianceManager.removeDefaultTrustedClaimIssuer',
  ChangeComplianceRequirement = 'complianceManager.changeComplianceRequirement',
}

export enum CorporateActionTx {
  SetMaxDetailsLength = 'corporateAction.setMaxDetailsLength',
  SetDefaultTargets = 'corporateAction.setDefaultTargets',
  SetDefaultWithholdingTax = 'corporateAction.setDefaultWithholdingTax',
  SetDidWithholdingTax = 'corporateAction.setDidWithholdingTax',
  InitiateCorporateAction = 'corporateAction.initiateCorporateAction',
  LinkCaDoc = 'corporateAction.linkCaDoc',
  RemoveCa = 'corporateAction.removeCa',
  ChangeRecordDate = 'corporateAction.changeRecordDate',
}

export enum CorporateBallotTx {
  AttachBallot = 'corporateBallot.attachBallot',
  Vote = 'corporateBallot.vote',
  ChangeEnd = 'corporateBallot.changeEnd',
  ChangeMeta = 'corporateBallot.changeMeta',
  ChangeRcv = 'corporateBallot.changeRcv',
  RemoveBallot = 'corporateBallot.removeBallot',
}

export enum PipsTx {
  SetPruneHistoricalPips = 'pips.setPruneHistoricalPips',
  SetMinProposalDeposit = 'pips.setMinProposalDeposit',
  SetDefaultEnactmentPeriod = 'pips.setDefaultEnactmentPeriod',
  SetPendingPipExpiry = 'pips.setPendingPipExpiry',
  SetMaxPipSkipCount = 'pips.setMaxPipSkipCount',
  SetActivePipLimit = 'pips.setActivePipLimit',
  Propose = 'pips.propose',
  Vote = 'pips.vote',
  ApproveCommitteeProposal = 'pips.approveCommitteeProposal',
  RejectProposal = 'pips.rejectProposal',
  PruneProposal = 'pips.pruneProposal',
  RescheduleExecution = 'pips.rescheduleExecution',
  ClearSnapshot = 'pips.clearSnapshot',
  Snapshot = 'pips.snapshot',
  EnactSnapshotResults = 'pips.enactSnapshotResults',
  ExecuteScheduledPip = 'pips.executeScheduledPip',
  ExpireScheduledPip = 'pips.expireScheduledPip',
}

export enum PortfolioTx {
  CreatePortfolio = 'portfolio.createPortfolio',
  DeletePortfolio = 'portfolio.deletePortfolio',
  MovePortfolioFunds = 'portfolio.movePortfolioFunds',
  RenamePortfolio = 'portfolio.renamePortfolio',
  QuitPortfolioCustody = 'portfolio.quitPortfolioCustody',
  AcceptPortfolioCustody = 'portfolio.acceptPortfolioCustody',
}

export enum ProtocolFeeTx {
  ChangeCoefficient = 'protocolFee.changeCoefficient',
  ChangeBaseFee = 'protocolFee.changeBaseFee',
}

export enum SchedulerTx {
  Schedule = 'scheduler.schedule',
  Cancel = 'scheduler.cancel',
  ScheduleNamed = 'scheduler.scheduleNamed',
  CancelNamed = 'scheduler.cancelNamed',
  ScheduleAfter = 'scheduler.scheduleAfter',
  ScheduleNamedAfter = 'scheduler.scheduleNamedAfter',
}

export enum SettlementTx {
  CreateVenue = 'settlement.createVenue',
  UpdateVenueDetails = 'settlement.updateVenueDetails',
  UpdateVenueType = 'settlement.updateVenueType',
  AddInstruction = 'settlement.addInstruction',
  AddAndAffirmInstruction = 'settlement.addAndAffirmInstruction',
  AffirmInstruction = 'settlement.affirmInstruction',
  WithdrawAffirmation = 'settlement.withdrawAffirmation',
  RejectInstruction = 'settlement.rejectInstruction',
  AffirmWithReceipts = 'settlement.affirmWithReceipts',
  ClaimReceipt = 'settlement.claimReceipt',
  UnclaimReceipt = 'settlement.unclaimReceipt',
  SetVenueFiltering = 'settlement.setVenueFiltering',
  AllowVenues = 'settlement.allowVenues',
  DisallowVenues = 'settlement.disallowVenues',
  ChangeReceiptValidity = 'settlement.changeReceiptValidity',
  ExecuteScheduledInstruction = 'settlement.executeScheduledInstruction',
  RescheduleInstruction = 'settlement.rescheduleInstruction',
}

export enum StatisticsTx {
  SetAssetTransferCompliance = 'statistics.setAssetTransferCompliance',
  SetEntitiesExempt = 'statistics.setEntitiesExempt',
  SetActiveAssetStats = 'statistics.setActiveAssetStats',
  BatchUpdateAssetStats = 'statistics.batchUpdateAssetStats',
}

export enum StoTx {
  CreateFundraiser = 'sto.createFundraiser',
  Invest = 'sto.invest',
  FreezeFundraiser = 'sto.freezeFundraiser',
  UnfreezeFundraiser = 'sto.unfreezeFundraiser',
  ModifyFundraiserWindow = 'sto.modifyFundraiserWindow',
  Stop = 'sto.stop',
}

export enum TreasuryTx {
  Disbursement = 'treasury.disbursement',
  Reimbursement = 'treasury.reimbursement',
}

export enum UtilityTx {
  Batch = 'utility.batch',
  BatchAtomic = 'utility.batchAtomic',
  BatchOptimistic = 'utility.batchOptimistic',
  RelayTx = 'utility.relayTx',
}

export enum ExternalAgentsTx {
  CreateGroup = 'externalAgents.createGroup',
  SetGroupPermissions = 'externalAgents.setGroupPermissions',
  RemoveAgent = 'externalAgents.removeAgent',
  Abdicate = 'externalAgents.abdicate',
  ChangeGroup = 'externalAgents.changeGroup',
  AcceptBecomeAgent = 'externalAgents.acceptBecomeAgent',
}

export enum RelayerTx {
  SetPayingKey = 'relayer.setPayingKey',
  AcceptPayingKey = 'relayer.acceptPayingKey',
  RemovePayingKey = 'relayer.removePayingKey',
  UpdatePolyxLimit = 'relayer.updatePolyxLimit',
  IncreasePolyxLimit = 'relayer.increasePolyxLimit',
  DecreasePolyxLimit = 'relayer.decreasePolyxLimit',
}

export enum RewardsTx {
  ClaimItnReward = 'rewards.claimItnReward',
  SetItnRewardStatus = 'rewards.setItnRewardStatus',
}

export enum TestUtilsTx {
  RegisterDid = 'testUtils.registerDid',
  MockCddRegisterDid = 'testUtils.mockCddRegisterDid',
  GetMyDid = 'testUtils.getMyDid',
  GetCddOf = 'testUtils.getCddOf',
}

export enum ModuleName {
  System = 'system',
  Babe = 'babe',
  Timestamp = 'timestamp',
  Indices = 'indices',
  Authorship = 'authorship',
  Balances = 'balances',
  Identity = 'identity',
  CddServiceProviders = 'cddServiceProviders',
  PolymeshCommittee = 'polymeshCommittee',
  CommitteeMembership = 'committeeMembership',
  TechnicalCommittee = 'technicalCommittee',
  TechnicalCommitteeMembership = 'technicalCommitteeMembership',
  UpgradeCommittee = 'upgradeCommittee',
  UpgradeCommitteeMembership = 'upgradeCommitteeMembership',
  MultiSig = 'multiSig',
  Bridge = 'bridge',
  Staking = 'staking',
  Session = 'session',
  Grandpa = 'grandpa',
  ImOnline = 'imOnline',
  Sudo = 'sudo',
  Asset = 'asset',
  CapitalDistribution = 'capitalDistribution',
  Checkpoint = 'checkpoint',
  ComplianceManager = 'complianceManager',
  CorporateAction = 'corporateAction',
  CorporateBallot = 'corporateBallot',
  Pips = 'pips',
  Portfolio = 'portfolio',
  ProtocolFee = 'protocolFee',
  Scheduler = 'scheduler',
  Settlement = 'settlement',
  Statistics = 'statistics',
  Sto = 'sto',
  Treasury = 'treasury',
  Utility = 'utility',
  ExternalAgents = 'externalAgents',
  Relayer = 'relayer',
  Rewards = 'rewards',
  TestUtils = 'testUtils',
}

export type TxTag =
  | SystemTx
  | BabeTx
  | TimestampTx
  | IndicesTx
  | AuthorshipTx
  | BalancesTx
  | IdentityTx
  | CddServiceProvidersTx
  | PolymeshCommitteeTx
  | CommitteeMembershipTx
  | TechnicalCommitteeTx
  | TechnicalCommitteeMembershipTx
  | UpgradeCommitteeTx
  | UpgradeCommitteeMembershipTx
  | MultiSigTx
  | BridgeTx
  | StakingTx
  | SessionTx
  | GrandpaTx
  | ImOnlineTx
  | SudoTx
  | AssetTx
  | CapitalDistributionTx
  | CheckpointTx
  | ComplianceManagerTx
  | CorporateActionTx
  | CorporateBallotTx
  | PipsTx
  | PortfolioTx
  | ProtocolFeeTx
  | SchedulerTx
  | SettlementTx
  | StatisticsTx
  | StoTx
  | TreasuryTx
  | UtilityTx
  | ExternalAgentsTx
  | RelayerTx
  | RewardsTx
  | TestUtilsTx;

export const TxTags = {
  system: SystemTx,
  babe: BabeTx,
  timestamp: TimestampTx,
  indices: IndicesTx,
  authorship: AuthorshipTx,
  balances: BalancesTx,
  identity: IdentityTx,
  cddServiceProviders: CddServiceProvidersTx,
  polymeshCommittee: PolymeshCommitteeTx,
  committeeMembership: CommitteeMembershipTx,
  technicalCommittee: TechnicalCommitteeTx,
  technicalCommitteeMembership: TechnicalCommitteeMembershipTx,
  upgradeCommittee: UpgradeCommitteeTx,
  upgradeCommitteeMembership: UpgradeCommitteeMembershipTx,
  multiSig: MultiSigTx,
  bridge: BridgeTx,
  staking: StakingTx,
  session: SessionTx,
  grandpa: GrandpaTx,
  imOnline: ImOnlineTx,
  sudo: SudoTx,
  asset: AssetTx,
  capitalDistribution: CapitalDistributionTx,
  checkpoint: CheckpointTx,
  complianceManager: ComplianceManagerTx,
  corporateAction: CorporateActionTx,
  corporateBallot: CorporateBallotTx,
  pips: PipsTx,
  portfolio: PortfolioTx,
  protocolFee: ProtocolFeeTx,
  scheduler: SchedulerTx,
  settlement: SettlementTx,
  statistics: StatisticsTx,
  sto: StoTx,
  treasury: TreasuryTx,
  utility: UtilityTx,
  externalAgents: ExternalAgentsTx,
  relayer: RelayerTx,
  rewards: RewardsTx,
  testUtils: TestUtilsTx,
};
