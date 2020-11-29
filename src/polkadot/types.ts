// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

export * from './polymesh/types';

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
  Suicide = 'system.suicide',
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

export enum BalancesTx {
  Transfer = 'balances.transfer',
  TransferWithMemo = 'balances.transferWithMemo',
  DepositBlockRewardReserveBalance = 'balances.depositBlockRewardReserveBalance',
  SetBalance = 'balances.setBalance',
  ForceTransfer = 'balances.forceTransfer',
  BurnAccountBalance = 'balances.burnAccountBalance',
}

export enum AuthorshipTx {
  SetUncles = 'authorship.setUncles',
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
  EnableIndividualCommissions = 'staking.enableIndividualCommissions',
  SetGlobalCommission = 'staking.setGlobalCommission',
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
  SetCommissionCap = 'staking.setCommissionCap',
  PayoutStakersBySystem = 'staking.payoutStakersBySystem',
  ChangeSlashingAllowedFor = 'staking.changeSlashingAllowedFor',
}

export enum SessionTx {
  SetKeys = 'session.setKeys',
  PurgeKeys = 'session.purgeKeys',
}

export enum FinalityTrackerTx {
  FinalHint = 'finalityTracker.finalHint',
}

export enum GrandpaTx {
  ReportEquivocation = 'grandpa.reportEquivocation',
  ReportEquivocationUnsigned = 'grandpa.reportEquivocationUnsigned',
  NoteStalled = 'grandpa.noteStalled',
}

export enum ImOnlineTx {
  Heartbeat = 'imOnline.heartbeat',
  SetSlashingParams = 'imOnline.setSlashingParams',
}

export enum SudoTx {
  Sudo = 'sudo.sudo',
  SudoUncheckedWeight = 'sudo.sudoUncheckedWeight',
  SetKey = 'sudo.setKey',
  SudoAs = 'sudo.sudoAs',
}

export enum MultiSigTx {
  MakeMultisigMaster = 'multiSig.makeMultisigMaster',
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
  ChangeAllSignersAndSigsRequired = 'multiSig.changeAllSignersAndSigsRequired',
  MakeMultisigSigner = 'multiSig.makeMultisigSigner',
  MakeMultisigPrimary = 'multiSig.makeMultisigPrimary',
}

export enum ContractsTx {
  UpdateSchedule = 'contracts.updateSchedule',
  PutCode = 'contracts.putCode',
  Call = 'contracts.call',
  Instantiate = 'contracts.instantiate',
  ClaimSurcharge = 'contracts.claimSurcharge',
  FreezeInstantiation = 'contracts.freezeInstantiation',
  UnfreezeInstantiation = 'contracts.unfreezeInstantiation',
  TransferTemplateOwnership = 'contracts.transferTemplateOwnership',
  ChangeTemplateFees = 'contracts.changeTemplateFees',
  ChangeTemplateMetaUrl = 'contracts.changeTemplateMetaUrl',
}

export enum TreasuryTx {
  Disbursement = 'treasury.disbursement',
  Reimbursement = 'treasury.reimbursement',
}

export enum PolymeshCommitteeTx {
  VoteOrPropose = 'polymeshCommittee.voteOrPropose',
  Vote = 'polymeshCommittee.vote',
  SetVoteThreshold = 'polymeshCommittee.setVoteThreshold',
  Close = 'polymeshCommittee.close',
  SetReleaseCoordinator = 'polymeshCommittee.setReleaseCoordinator',
  VoteEnactReferendum = 'polymeshCommittee.voteEnactReferendum',
  VoteRejectReferendum = 'polymeshCommittee.voteRejectReferendum',
  SetExpiresAfter = 'polymeshCommittee.setExpiresAfter',
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

export enum PipsTx {
  SetMaxPipSkipCount = 'pips.setMaxPipSkipCount',
  SetActivePipLimit = 'pips.setActivePipLimit',
  ApproveCommitteeProposal = 'pips.approveCommitteeProposal',
  RejectProposal = 'pips.rejectProposal',
  RescheduleExecution = 'pips.rescheduleExecution',
  ClearSnapshot = 'pips.clearSnapshot',
  Snapshot = 'pips.snapshot',
  EnactSnapshotResults = 'pips.enactSnapshotResults',
  SetPruneHistoricalPips = 'pips.setPruneHistoricalPips',
  SetMinProposalDeposit = 'pips.setMinProposalDeposit',
  SetQuorumThreshold = 'pips.setQuorumThreshold',
  SetProposalDuration = 'pips.setProposalDuration',
  SetProposalCoolOffPeriod = 'pips.setProposalCoolOffPeriod',
  SetDefaultEnactmentPeriod = 'pips.setDefaultEnactmentPeriod',
  Propose = 'pips.propose',
  AmendProposal = 'pips.amendProposal',
  CancelProposal = 'pips.cancelProposal',
  BondAdditionalDeposit = 'pips.bondAdditionalDeposit',
  UnbondDeposit = 'pips.unbondDeposit',
  Vote = 'pips.vote',
  KillProposal = 'pips.killProposal',
  PruneProposal = 'pips.pruneProposal',
  FastTrackProposal = 'pips.fastTrackProposal',
  EmergencyReferendum = 'pips.emergencyReferendum',
  EnactReferendum = 'pips.enactReferendum',
  RejectReferendum = 'pips.rejectReferendum',
  OverrideReferendumEnactmentPeriod = 'pips.overrideReferendumEnactmentPeriod',
  SetPendingPipExpiry = 'pips.setPendingPipExpiry',
}

export enum TechnicalCommitteeTx {
  SetVoteThreshold = 'technicalCommittee.setVoteThreshold',
  SetReleaseCoordinator = 'technicalCommittee.setReleaseCoordinator',
  Close = 'technicalCommittee.close',
  VoteOrPropose = 'technicalCommittee.voteOrPropose',
  Vote = 'technicalCommittee.vote',
  SetExpiresAfter = 'technicalCommittee.setExpiresAfter',
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
  Close = 'upgradeCommittee.close',
  VoteOrPropose = 'upgradeCommittee.voteOrPropose',
  Vote = 'upgradeCommittee.vote',
  SetExpiresAfter = 'upgradeCommittee.setExpiresAfter',
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

export enum AssetTx {
  Transfer = 'asset.transfer',
  ControllerTransfer = 'asset.controllerTransfer',
  Approve = 'asset.approve',
  TransferFrom = 'asset.transferFrom',
  BatchIssue = 'asset.batchIssue',
  Redeem = 'asset.redeem',
  RedeemFrom = 'asset.redeemFrom',
  ControllerRedeem = 'asset.controllerRedeem',
  TransferWithData = 'asset.transferWithData',
  TransferFromWithData = 'asset.transferFromWithData',
  IsIssuable = 'asset.isIssuable',
  IncreaseCustodyAllowance = 'asset.increaseCustodyAllowance',
  IncreaseCustodyAllowanceOf = 'asset.increaseCustodyAllowanceOf',
  TransferByCustodian = 'asset.transferByCustodian',
  SetTreasuryDid = 'asset.setTreasuryDid',
  RegisterTicker = 'asset.registerTicker',
  AcceptTickerTransfer = 'asset.acceptTickerTransfer',
  AcceptPrimaryIssuanceAgentTransfer = 'asset.acceptPrimaryIssuanceAgentTransfer',
  AcceptAssetOwnershipTransfer = 'asset.acceptAssetOwnershipTransfer',
  CreateAsset = 'asset.createAsset',
  Freeze = 'asset.freeze',
  Unfreeze = 'asset.unfreeze',
  RenameAsset = 'asset.renameAsset',
  CreateCheckpoint = 'asset.createCheckpoint',
  Issue = 'asset.issue',
  MakeDivisible = 'asset.makeDivisible',
  BatchAddDocument = 'asset.batchAddDocument',
  BatchRemoveDocument = 'asset.batchRemoveDocument',
  SetFundingRound = 'asset.setFundingRound',
  UpdateIdentifiers = 'asset.updateIdentifiers',
  AddExtension = 'asset.addExtension',
  ArchiveExtension = 'asset.archiveExtension',
  UnarchiveExtension = 'asset.unarchiveExtension',
  RemovePrimaryIssuanceAgent = 'asset.removePrimaryIssuanceAgent',
  RemoveSmartExtension = 'asset.removeSmartExtension',
  ClaimClassicTicker = 'asset.claimClassicTicker',
  AddDocuments = 'asset.addDocuments',
  RemoveDocuments = 'asset.removeDocuments',
  ReserveClassicTicker = 'asset.reserveClassicTicker',
}

export enum DividendTx {
  New = 'dividend.new',
  Cancel = 'dividend.cancel',
  Claim = 'dividend.claim',
  ClaimUnclaimed = 'dividend.claimUnclaimed',
}

export enum IdentityTx {
  RemoveSigningKeys = 'identity.removeSigningKeys',
  SetMasterKey = 'identity.setMasterKey',
  AcceptMasterKey = 'identity.acceptMasterKey',
  FreezeSigningKeys = 'identity.freezeSigningKeys',
  UnfreezeSigningKeys = 'identity.unfreezeSigningKeys',
  BatchAddSigningKeyWithAuthorization = 'identity.batchAddSigningKeyWithAuthorization',
  RegisterDid = 'identity.registerDid',
  CddRegisterDid = 'identity.cddRegisterDid',
  MockCddRegisterDid = 'identity.mockCddRegisterDid',
  InvalidateCddClaims = 'identity.invalidateCddClaims',
  RemoveSecondaryKeys = 'identity.removeSecondaryKeys',
  SetPrimaryKey = 'identity.setPrimaryKey',
  AcceptPrimaryKey = 'identity.acceptPrimaryKey',
  ChangeCddRequirementForMkRotation = 'identity.changeCddRequirementForMkRotation',
  JoinIdentityAsKey = 'identity.joinIdentityAsKey',
  JoinIdentityAsIdentity = 'identity.joinIdentityAsIdentity',
  LeaveIdentityAsKey = 'identity.leaveIdentityAsKey',
  LeaveIdentityAsIdentity = 'identity.leaveIdentityAsIdentity',
  AddClaim = 'identity.addClaim',
  BatchAddClaim = 'identity.batchAddClaim',
  ForwardedCall = 'identity.forwardedCall',
  RevokeClaim = 'identity.revokeClaim',
  BatchRevokeClaim = 'identity.batchRevokeClaim',
  SetPermissionToSigner = 'identity.setPermissionToSigner',
  FreezeSecondaryKeys = 'identity.freezeSecondaryKeys',
  UnfreezeSecondaryKeys = 'identity.unfreezeSecondaryKeys',
  GetMyDid = 'identity.getMyDid',
  GetCddOf = 'identity.getCddOf',
  AddAuthorization = 'identity.addAuthorization',
  BatchAddAuthorization = 'identity.batchAddAuthorization',
  RemoveAuthorization = 'identity.removeAuthorization',
  BatchRemoveAuthorization = 'identity.batchRemoveAuthorization',
  AcceptAuthorization = 'identity.acceptAuthorization',
  BatchAcceptAuthorization = 'identity.batchAcceptAuthorization',
  BatchAddSecondaryKeyWithAuthorization = 'identity.batchAddSecondaryKeyWithAuthorization',
  RevokeOffchainAuthorization = 'identity.revokeOffchainAuthorization',
  LegacySetPermissionToSigner = 'identity.legacySetPermissionToSigner',
  AddSecondaryKeysWithAuthorization = 'identity.addSecondaryKeysWithAuthorization',
  AddInvestorUniquenessClaim = 'identity.addInvestorUniquenessClaim',
  GcAddCddClaim = 'identity.gcAddCddClaim',
  GcRevokeCddClaim = 'identity.gcRevokeCddClaim',
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
  BatchForceHandleBridgeTx = 'bridge.batchForceHandleBridgeTx',
  ProposeBridgeTx = 'bridge.proposeBridgeTx',
  BatchProposeBridgeTx = 'bridge.batchProposeBridgeTx',
  HandleBridgeTx = 'bridge.handleBridgeTx',
  BatchHandleBridgeTx = 'bridge.batchHandleBridgeTx',
  BatchFreezeTx = 'bridge.batchFreezeTx',
  BatchUnfreezeTx = 'bridge.batchUnfreezeTx',
  FreezeTxs = 'bridge.freezeTxs',
  UnfreezeTxs = 'bridge.unfreezeTxs',
  HandleScheduledBridgeTx = 'bridge.handleScheduledBridgeTx',
}

export enum ComplianceManagerTx {
  AddActiveRule = 'complianceManager.addActiveRule',
  RemoveActiveRule = 'complianceManager.removeActiveRule',
  ReplaceAssetRules = 'complianceManager.replaceAssetRules',
  ResetActiveRules = 'complianceManager.resetActiveRules',
  PauseAssetRules = 'complianceManager.pauseAssetRules',
  ResumeAssetRules = 'complianceManager.resumeAssetRules',
  ChangeAssetRule = 'complianceManager.changeAssetRule',
  BatchChangeAssetRule = 'complianceManager.batchChangeAssetRule',
  AddComplianceRequirement = 'complianceManager.addComplianceRequirement',
  RemoveComplianceRequirement = 'complianceManager.removeComplianceRequirement',
  ReplaceAssetCompliance = 'complianceManager.replaceAssetCompliance',
  ResetAssetCompliance = 'complianceManager.resetAssetCompliance',
  PauseAssetCompliance = 'complianceManager.pauseAssetCompliance',
  ResumeAssetCompliance = 'complianceManager.resumeAssetCompliance',
  AddDefaultTrustedClaimIssuer = 'complianceManager.addDefaultTrustedClaimIssuer',
  RemoveDefaultTrustedClaimIssuer = 'complianceManager.removeDefaultTrustedClaimIssuer',
  BatchAddDefaultTrustedClaimIssuer = 'complianceManager.batchAddDefaultTrustedClaimIssuer',
  BatchRemoveDefaultTrustedClaimIssuer = 'complianceManager.batchRemoveDefaultTrustedClaimIssuer',
  ChangeComplianceRequirement = 'complianceManager.changeComplianceRequirement',
  BatchChangeComplianceRequirement = 'complianceManager.batchChangeComplianceRequirement',
}

export enum VotingTx {
  AddBallot = 'voting.addBallot',
  Vote = 'voting.vote',
  CancelBallot = 'voting.cancelBallot',
}

export enum StoCappedTx {
  LaunchSto = 'stoCapped.launchSto',
  BuyTokens = 'stoCapped.buyTokens',
  PauseSto = 'stoCapped.pauseSto',
  UnpauseSto = 'stoCapped.unpauseSto',
}

export enum ExemptionTx {
  ModifyExemptionList = 'exemption.modifyExemptionList',
}

export enum SettlementTx {
  CreateVenue = 'settlement.createVenue',
  UpdateVenue = 'settlement.updateVenue',
  AddInstruction = 'settlement.addInstruction',
  AddAndAuthorizeInstruction = 'settlement.addAndAuthorizeInstruction',
  AuthorizeInstruction = 'settlement.authorizeInstruction',
  UnauthorizeInstruction = 'settlement.unauthorizeInstruction',
  RejectInstruction = 'settlement.rejectInstruction',
  AuthorizeWithReceipts = 'settlement.authorizeWithReceipts',
  ClaimReceipt = 'settlement.claimReceipt',
  UnclaimReceipt = 'settlement.unclaimReceipt',
  SetVenueFiltering = 'settlement.setVenueFiltering',
  AllowVenues = 'settlement.allowVenues',
  DisallowVenues = 'settlement.disallowVenues',
  AddAndAffirmInstruction = 'settlement.addAndAffirmInstruction',
  AffirmInstruction = 'settlement.affirmInstruction',
  WithdrawAffirmation = 'settlement.withdrawAffirmation',
  AffirmWithReceipts = 'settlement.affirmWithReceipts',
  ExecuteScheduledInstruction = 'settlement.executeScheduledInstruction',
}

export enum StoTx {
  CreateFundraiser = 'sto.createFundraiser',
  Invest = 'sto.invest',
  FreezeFundraiser = 'sto.freezeFundraiser',
  UnfreezeFundraiser = 'sto.unfreezeFundraiser',
  ModifyFundraiserWindow = 'sto.modifyFundraiserWindow',
  Stop = 'sto.stop',
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

export enum ProtocolFeeTx {
  ChangeCoefficient = 'protocolFee.changeCoefficient',
  ChangeBaseFee = 'protocolFee.changeBaseFee',
}

export enum UtilityTx {
  Batch = 'utility.batch',
  BatchAtomic = 'utility.batchAtomic',
  BatchOptimistic = 'utility.batchOptimistic',
  RelayTx = 'utility.relayTx',
}

export enum PortfolioTx {
  MovePortfolio = 'portfolio.movePortfolio',
  CreatePortfolio = 'portfolio.createPortfolio',
  DeletePortfolio = 'portfolio.deletePortfolio',
  MovePortfolioFunds = 'portfolio.movePortfolioFunds',
  RenamePortfolio = 'portfolio.renamePortfolio',
}

export enum ConfidentialTx {
  AddRangeProof = 'confidential.addRangeProof',
  AddVerifyRangeProof = 'confidential.addVerifyRangeProof',
}

export enum SchedulerTx {
  Schedule = 'scheduler.schedule',
  Cancel = 'scheduler.cancel',
  ScheduleNamed = 'scheduler.scheduleNamed',
  CancelNamed = 'scheduler.cancelNamed',
  ScheduleAfter = 'scheduler.scheduleAfter',
  ScheduleNamedAfter = 'scheduler.scheduleNamedAfter',
}

export enum CorporateActionTx {
  SetMaxDetailsLength = 'corporateAction.setMaxDetailsLength',
  ResetCaa = 'corporateAction.resetCaa',
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

export type TxTag =
  | SystemTx
  | BabeTx
  | TimestampTx
  | IndicesTx
  | BalancesTx
  | AuthorshipTx
  | StakingTx
  | SessionTx
  | FinalityTrackerTx
  | GrandpaTx
  | ImOnlineTx
  | SudoTx
  | MultiSigTx
  | ContractsTx
  | TreasuryTx
  | PolymeshCommitteeTx
  | CommitteeMembershipTx
  | PipsTx
  | TechnicalCommitteeTx
  | TechnicalCommitteeMembershipTx
  | UpgradeCommitteeTx
  | UpgradeCommitteeMembershipTx
  | AssetTx
  | DividendTx
  | IdentityTx
  | BridgeTx
  | ComplianceManagerTx
  | VotingTx
  | StoCappedTx
  | ExemptionTx
  | SettlementTx
  | StoTx
  | CddServiceProvidersTx
  | ProtocolFeeTx
  | UtilityTx
  | PortfolioTx
  | ConfidentialTx
  | SchedulerTx
  | CorporateActionTx
  | CorporateBallotTx
  | CapitalDistributionTx
  | CheckpointTx;

export const TxTags = {
  system: SystemTx,
  babe: BabeTx,
  timestamp: TimestampTx,
  indices: IndicesTx,
  balances: BalancesTx,
  authorship: AuthorshipTx,
  staking: StakingTx,
  session: SessionTx,
  finalityTracker: FinalityTrackerTx,
  grandpa: GrandpaTx,
  imOnline: ImOnlineTx,
  sudo: SudoTx,
  multiSig: MultiSigTx,
  contracts: ContractsTx,
  treasury: TreasuryTx,
  polymeshCommittee: PolymeshCommitteeTx,
  committeeMembership: CommitteeMembershipTx,
  pips: PipsTx,
  technicalCommittee: TechnicalCommitteeTx,
  technicalCommitteeMembership: TechnicalCommitteeMembershipTx,
  upgradeCommittee: UpgradeCommitteeTx,
  upgradeCommitteeMembership: UpgradeCommitteeMembershipTx,
  asset: AssetTx,
  dividend: DividendTx,
  identity: IdentityTx,
  bridge: BridgeTx,
  complianceManager: ComplianceManagerTx,
  voting: VotingTx,
  stoCapped: StoCappedTx,
  exemption: ExemptionTx,
  settlement: SettlementTx,
  sto: StoTx,
  cddServiceProviders: CddServiceProvidersTx,
  protocolFee: ProtocolFeeTx,
  utility: UtilityTx,
  portfolio: PortfolioTx,
  confidential: ConfidentialTx,
  scheduler: SchedulerTx,
  corporateAction: CorporateActionTx,
  corporateBallot: CorporateBallotTx,
  capitalDistribution: CapitalDistributionTx,
  checkpoint: CheckpointTx,
};
