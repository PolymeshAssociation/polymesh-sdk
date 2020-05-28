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

export enum TimestampTx {
  Set = 'timestamp.set',
}

export enum IndicesTx {
  Claim = 'indices.claim',
  Transfer = 'indices.transfer',
  Free = 'indices.free',
  ForceTransfer = 'indices.forceTransfer',
}

export enum BalancesTx {
  Transfer = 'balances.transfer',
  TransferWithMemo = 'balances.transferWithMemo',
  TopUpIdentityBalance = 'balances.topUpIdentityBalance',
  ReclaimIdentityBalance = 'balances.reclaimIdentityBalance',
  ChangeChargeDidFlag = 'balances.changeChargeDidFlag',
  TopUpBrrBalance = 'balances.topUpBrrBalance',
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
  PayoutNominator = 'staking.payoutNominator',
  PayoutValidator = 'staking.payoutValidator',
  Rebond = 'staking.rebond',
  SetHistoryDepth = 'staking.setHistoryDepth',
  ReapStash = 'staking.reapStash',
}

export enum SessionTx {
  SetKeys = 'session.setKeys',
  PurgeKeys = 'session.purgeKeys',
}

export enum FinalityTrackerTx {
  FinalHint = 'finalityTracker.finalHint',
}

export enum GrandpaTx {
  ReportMisbehavior = 'grandpa.reportMisbehavior',
}

export enum ImOnlineTx {
  Heartbeat = 'imOnline.heartbeat',
  SetSlashingParams = 'imOnline.setSlashingParams',
}

export enum SudoTx {
  Sudo = 'sudo.sudo',
  SetKey = 'sudo.setKey',
  SudoAs = 'sudo.sudoAs',
}

export enum MultiSigTx {
  CreateMultisig = 'multiSig.createMultisig',
  CreateOrApproveProposalAsIdentity = 'multiSig.createOrApproveProposalAsIdentity',
  CreateOrApproveProposalAsKey = 'multiSig.createOrApproveProposalAsKey',
  CreateProposalAsIdentity = 'multiSig.createProposalAsIdentity',
  CreateProposalAsKey = 'multiSig.createProposalAsKey',
  ApproveAsIdentity = 'multiSig.approveAsIdentity',
  ApproveAsKey = 'multiSig.approveAsKey',
  AcceptMultisigSignerAsIdentity = 'multiSig.acceptMultisigSignerAsIdentity',
  AcceptMultisigSignerAsKey = 'multiSig.acceptMultisigSignerAsKey',
  AddMultisigSigner = 'multiSig.addMultisigSigner',
  RemoveMultisigSigner = 'multiSig.removeMultisigSigner',
  AddMultisigSignersViaCreator = 'multiSig.addMultisigSignersViaCreator',
  RemoveMultisigSignersViaCreator = 'multiSig.removeMultisigSignersViaCreator',
  ChangeSigsRequired = 'multiSig.changeSigsRequired',
  ChangeAllSignersAndSigsRequired = 'multiSig.changeAllSignersAndSigsRequired',
  MakeMultisigSigner = 'multiSig.makeMultisigSigner',
  MakeMultisigMaster = 'multiSig.makeMultisigMaster',
}

export enum ContractsTx {
  UpdateSchedule = 'contracts.updateSchedule',
  PutCode = 'contracts.putCode',
  Call = 'contracts.call',
  Instantiate = 'contracts.instantiate',
  ClaimSurcharge = 'contracts.claimSurcharge',
}

export enum TreasuryTx {
  Disbursement = 'treasury.disbursement',
  Reimbursement = 'treasury.reimbursement',
}

export enum PolymeshCommitteeTx {
  SetVoteThreshold = 'polymeshCommittee.setVoteThreshold',
  Propose = 'polymeshCommittee.propose',
  Vote = 'polymeshCommittee.vote',
  Close = 'polymeshCommittee.close',
  SetReleaseCoordinator = 'polymeshCommittee.setReleaseCoordinator',
}

export enum CommitteeMembershipTx {
  DisableMember = 'committeeMembership.disableMember',
  AddMember = 'committeeMembership.addMember',
  RemoveMember = 'committeeMembership.removeMember',
  SwapMember = 'committeeMembership.swapMember',
  ResetMembers = 'committeeMembership.resetMembers',
  AbdicateMembership = 'committeeMembership.abdicateMembership',
}

export enum PipsTx {
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
  FastTrackProposal = 'pips.fastTrackProposal',
  EmergencyReferendum = 'pips.emergencyReferendum',
  EnactReferendum = 'pips.enactReferendum',
  RejectReferendum = 'pips.rejectReferendum',
  OverrideReferendumEnactmentPeriod = 'pips.overrideReferendumEnactmentPeriod',
}

export enum AssetTx {
  RegisterTicker = 'asset.registerTicker',
  AcceptTickerTransfer = 'asset.acceptTickerTransfer',
  AcceptAssetOwnershipTransfer = 'asset.acceptAssetOwnershipTransfer',
  CreateAsset = 'asset.createAsset',
  Freeze = 'asset.freeze',
  Unfreeze = 'asset.unfreeze',
  RenameAsset = 'asset.renameAsset',
  Transfer = 'asset.transfer',
  ControllerTransfer = 'asset.controllerTransfer',
  Approve = 'asset.approve',
  TransferFrom = 'asset.transferFrom',
  CreateCheckpoint = 'asset.createCheckpoint',
  Issue = 'asset.issue',
  BatchIssue = 'asset.batchIssue',
  Redeem = 'asset.redeem',
  RedeemFrom = 'asset.redeemFrom',
  ControllerRedeem = 'asset.controllerRedeem',
  MakeDivisible = 'asset.makeDivisible',
  TransferWithData = 'asset.transferWithData',
  TransferFromWithData = 'asset.transferFromWithData',
  IsIssuable = 'asset.isIssuable',
  AddDocuments = 'asset.addDocuments',
  RemoveDocuments = 'asset.removeDocuments',
  UpdateDocuments = 'asset.updateDocuments',
  IncreaseCustodyAllowance = 'asset.increaseCustodyAllowance',
  IncreaseCustodyAllowanceOf = 'asset.increaseCustodyAllowanceOf',
  TransferByCustodian = 'asset.transferByCustodian',
  SetFundingRound = 'asset.setFundingRound',
  UpdateIdentifiers = 'asset.updateIdentifiers',
  AddExtension = 'asset.addExtension',
  ArchiveExtension = 'asset.archiveExtension',
  UnarchiveExtension = 'asset.unarchiveExtension',
}

export enum DividendTx {
  New = 'dividend.new',
  Cancel = 'dividend.cancel',
  Claim = 'dividend.claim',
  ClaimUnclaimed = 'dividend.claimUnclaimed',
}

export enum IdentityTx {
  RegisterDid = 'identity.registerDid',
  CddRegisterDid = 'identity.cddRegisterDid',
  InvalidateCddClaims = 'identity.invalidateCddClaims',
  RemoveSigningItems = 'identity.removeSigningItems',
  SetMasterKey = 'identity.setMasterKey',
  AcceptMasterKey = 'identity.acceptMasterKey',
  ChangeCddRequirementForMkRotation = 'identity.changeCddRequirementForMkRotation',
  JoinIdentityAsKey = 'identity.joinIdentityAsKey',
  JoinIdentityAsIdentity = 'identity.joinIdentityAsIdentity',
  AddClaim = 'identity.addClaim',
  AddClaimsBatch = 'identity.addClaimsBatch',
  ForwardedCall = 'identity.forwardedCall',
  RevokeClaim = 'identity.revokeClaim',
  RevokeClaimsBatch = 'identity.revokeClaimsBatch',
  SetPermissionToSigner = 'identity.setPermissionToSigner',
  FreezeSigningKeys = 'identity.freezeSigningKeys',
  UnfreezeSigningKeys = 'identity.unfreezeSigningKeys',
  GetMyDid = 'identity.getMyDid',
  GetCddOf = 'identity.getCddOf',
  AddAuthorization = 'identity.addAuthorization',
  AddAuthorizationAsKey = 'identity.addAuthorizationAsKey',
  BatchAddAuthorization = 'identity.batchAddAuthorization',
  RemoveAuthorization = 'identity.removeAuthorization',
  BatchRemoveAuthorization = 'identity.batchRemoveAuthorization',
  AcceptAuthorization = 'identity.acceptAuthorization',
  BatchAcceptAuthorization = 'identity.batchAcceptAuthorization',
  AddSigningItemsWithAuthorization = 'identity.addSigningItemsWithAuthorization',
  RevokeOffchainAuthorization = 'identity.revokeOffchainAuthorization',
}

export enum BridgeTx {
  ChangeController = 'bridge.changeController',
  ChangeAdmin = 'bridge.changeAdmin',
  ChangeTimelock = 'bridge.changeTimelock',
  Freeze = 'bridge.freeze',
  Unfreeze = 'bridge.unfreeze',
  ChangeBridgeLimit = 'bridge.changeBridgeLimit',
  ChangeBridgeWhitelist = 'bridge.changeBridgeWhitelist',
  ForceHandleBridgeTx = 'bridge.forceHandleBridgeTx',
  ForceHandleBridgeTxs = 'bridge.forceHandleBridgeTxs',
  ProposeBridgeTx = 'bridge.proposeBridgeTx',
  ProposeBridgeTxs = 'bridge.proposeBridgeTxs',
  HandleBridgeTx = 'bridge.handleBridgeTx',
  HandleBridgeTxs = 'bridge.handleBridgeTxs',
  FreezeTxs = 'bridge.freezeTxs',
  UnfreezeTxs = 'bridge.unfreezeTxs',
}

export enum ComplianceManagerTx {
  AddActiveRule = 'complianceManager.addActiveRule',
  RemoveActiveRule = 'complianceManager.removeActiveRule',
  ReplaceAssetRules = 'complianceManager.replaceAssetRules',
  ResetActiveRules = 'complianceManager.resetActiveRules',
  PauseAssetRules = 'complianceManager.pauseAssetRules',
  ResumeAssetRules = 'complianceManager.resumeAssetRules',
  AddDefaultTrustedClaimIssuer = 'complianceManager.addDefaultTrustedClaimIssuer',
  RemoveDefaultTrustedClaimIssuer = 'complianceManager.removeDefaultTrustedClaimIssuer',
  AddDefaultTrustedClaimIssuersBatch = 'complianceManager.addDefaultTrustedClaimIssuersBatch',
  RemoveDefaultTrustedClaimIssuersBatch = 'complianceManager.removeDefaultTrustedClaimIssuersBatch',
  ChangeAssetRule = 'complianceManager.changeAssetRule',
  ChangeAssetRuleBatch = 'complianceManager.changeAssetRuleBatch',
}

export enum VotingTx {
  AddBallot = 'voting.addBallot',
  Vote = 'voting.vote',
  CancelBallot = 'voting.cancelBallot',
}

export enum StoCappedTx {
  LaunchSto = 'stoCapped.launchSto',
  BuyTokens = 'stoCapped.buyTokens',
  ModifyAllowedTokens = 'stoCapped.modifyAllowedTokens',
  BuyTokensBySimpleToken = 'stoCapped.buyTokensBySimpleToken',
  PauseSto = 'stoCapped.pauseSto',
  UnpauseSto = 'stoCapped.unpauseSto',
}

export enum ExemptionTx {
  ModifyExemptionList = 'exemption.modifyExemptionList',
}

export enum SimpleTokenTx {
  CreateToken = 'simpleToken.createToken',
  Approve = 'simpleToken.approve',
  Transfer = 'simpleToken.transfer',
  TransferFrom = 'simpleToken.transferFrom',
}

export enum CddServiceProvidersTx {
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

export type TxTag =
  | SystemTx
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
  | AssetTx
  | DividendTx
  | IdentityTx
  | BridgeTx
  | ComplianceManagerTx
  | VotingTx
  | StoCappedTx
  | ExemptionTx
  | SimpleTokenTx
  | CddServiceProvidersTx
  | ProtocolFeeTx;

export const TxTags = {
  system: SystemTx,
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
  asset: AssetTx,
  dividend: DividendTx,
  identity: IdentityTx,
  bridge: BridgeTx,
  complianceManager: ComplianceManagerTx,
  voting: VotingTx,
  stoCapped: StoCappedTx,
  exemption: ExemptionTx,
  simpleToken: SimpleTokenTx,
  cddServiceProviders: CddServiceProvidersTx,
  protocolFee: ProtocolFeeTx,
};
