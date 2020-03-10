// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable @typescript-eslint/no-empty-interface */

export * from './polymesh/types';

export enum SystemTx {
  FillBlock = 'system.fillBlock',
  Remark = 'system.remark',
  SetHeapPages = 'system.setHeapPages',
  SetCode = 'system.setCode',
  SetStorage = 'system.setStorage',
  KillStorage = 'system.killStorage',
  KillPrefix = 'system.killPrefix',
}

export enum TimestampTx {
  Set = 'timestamp.set',
}

export enum BalancesTx {
  Transfer = 'balances.transfer',
  TransferWithMemo = 'balances.transferWithMemo',
  TopUpIdentityBalance = 'balances.topUpIdentityBalance',
  ReclaimIdentityBalance = 'balances.reclaimIdentityBalance',
  ChangeChargeDidFlag = 'balances.changeChargeDidFlag',
  SetBalance = 'balances.setBalance',
  ForceTransfer = 'balances.forceTransfer',
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
  AddPotentialValidator = 'staking.addPotentialValidator',
  RemoveValidator = 'staking.removeValidator',
  ComplianceFailed = 'staking.complianceFailed',
  CompliancePassed = 'staking.compliancePassed',
  ValidateCddExpiryNominators = 'staking.validateCddExpiryNominators',
  EnableIndividualCommissions = 'staking.enableIndividualCommissions',
  SetGlobalComission = 'staking.setGlobalComission',
  SetMinBondThreshold = 'staking.setMinBondThreshold',
  ForceNoEras = 'staking.forceNoEras',
  ForceNewEra = 'staking.forceNewEra',
  SetInvulnerables = 'staking.setInvulnerables',
  ForceUnstake = 'staking.forceUnstake',
  ForceNewEraAlways = 'staking.forceNewEraAlways',
  CancelDeferredSlash = 'staking.cancelDeferredSlash',
}

export enum SessionTx {
  SetKeys = 'session.setKeys',
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
  ChangeSigsRequired = 'multiSig.changeSigsRequired',
}

export enum ContractsTx {
  UpdateSchedule = 'contracts.updateSchedule',
  PutCode = 'contracts.putCode',
  Call = 'contracts.call',
  Instantiate = 'contracts.instantiate',
  ClaimSurcharge = 'contracts.claimSurcharge',
}

export enum TreasuryTx {
  ProposeSpend = 'treasury.proposeSpend',
  RejectProposal = 'treasury.rejectProposal',
  ApproveProposal = 'treasury.approveProposal',
}

export enum PolymeshCommitteeTx {
  SetVoteThreshold = 'polymeshCommittee.setVoteThreshold',
  Propose = 'polymeshCommittee.propose',
  Vote = 'polymeshCommittee.vote',
}

export enum CommitteeMembershipTx {
  AddMember = 'committeeMembership.addMember',
  RemoveMember = 'committeeMembership.removeMember',
  SwapMember = 'committeeMembership.swapMember',
  ResetMembers = 'committeeMembership.resetMembers',
  AbdicateMembership = 'committeeMembership.abdicateMembership',
}

export enum MipsTx {
  SetMinProposalDeposit = 'mips.setMinProposalDeposit',
  SetQuorumThreshold = 'mips.setQuorumThreshold',
  SetProposalDuration = 'mips.setProposalDuration',
  Propose = 'mips.propose',
  Vote = 'mips.vote',
  KillProposal = 'mips.killProposal',
  FastTrackProposal = 'mips.fastTrackProposal',
  EmergencyReferendum = 'mips.emergencyReferendum',
  EnactReferendum = 'mips.enactReferendum',
}

export enum AssetTx {
  RegisterTicker = 'asset.registerTicker',
  AcceptTickerTransfer = 'asset.acceptTickerTransfer',
  AcceptTokenOwnershipTransfer = 'asset.acceptTokenOwnershipTransfer',
  CreateToken = 'asset.createToken',
  Freeze = 'asset.freeze',
  Unfreeze = 'asset.unfreeze',
  RenameToken = 'asset.renameToken',
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
  CanTransfer = 'asset.canTransfer',
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

export enum BridgeTx {
  ChangeController = 'bridge.changeController',
  ChangeAdminKey = 'bridge.changeAdminKey',
  Freeze = 'bridge.freeze',
  Unfreeze = 'bridge.unfreeze',
  ProposeBridgeTx = 'bridge.proposeBridgeTx',
  FinalizePending = 'bridge.finalizePending',
  HandleBridgeTx = 'bridge.handleBridgeTx',
  FreezeTxs = 'bridge.freezeTxs',
  UnfreezeTxs = 'bridge.unfreezeTxs',
  CheckAdmin = 'bridge.checkAdmin',
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
  AddSigningItems = 'identity.addSigningItems',
  RemoveSigningItems = 'identity.removeSigningItems',
  SetMasterKey = 'identity.setMasterKey',
  AcceptMasterKey = 'identity.acceptMasterKey',
  ChangeCddRequirementForMkRotation = 'identity.changeCddRequirementForMkRotation',
  AddClaim = 'identity.addClaim',
  AddClaimsBatch = 'identity.addClaimsBatch',
  ForwardedCall = 'identity.forwardedCall',
  RevokeClaim = 'identity.revokeClaim',
  RevokeClaimsBatch = 'identity.revokeClaimsBatch',
  SetPermissionToSigner = 'identity.setPermissionToSigner',
  FreezeSigningKeys = 'identity.freezeSigningKeys',
  UnfreezeSigningKeys = 'identity.unfreezeSigningKeys',
  GetMyDid = 'identity.getMyDid',
  AddAuthorization = 'identity.addAuthorization',
  AddAuthorizationAsKey = 'identity.addAuthorizationAsKey',
  BatchAddAuthorization = 'identity.batchAddAuthorization',
  RemoveAuthorization = 'identity.removeAuthorization',
  BatchRemoveAuthorization = 'identity.batchRemoveAuthorization',
  AcceptAuthorization = 'identity.acceptAuthorization',
  BatchAcceptAuthorization = 'identity.batchAcceptAuthorization',
  AuthorizeJoinToIdentity = 'identity.authorizeJoinToIdentity',
  UnauthorizedJoinToIdentity = 'identity.unauthorizedJoinToIdentity',
  AddSigningItemsWithAuthorization = 'identity.addSigningItemsWithAuthorization',
  RevokeOffchainAuthorization = 'identity.revokeOffchainAuthorization',
}

export enum GeneralTmTx {
  AddActiveRule = 'generalTm.addActiveRule',
  RemoveActiveRule = 'generalTm.removeActiveRule',
  ResetActiveRules = 'generalTm.resetActiveRules',
  PauseAssetRules = 'generalTm.pauseAssetRules',
  ResumeAssetRules = 'generalTm.resumeAssetRules',
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

export enum PercentageTmTx {
  ToggleMaximumPercentageRestriction = 'percentageTm.toggleMaximumPercentageRestriction',
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
  AddMember = 'cddServiceProviders.addMember',
  RemoveMember = 'cddServiceProviders.removeMember',
  SwapMember = 'cddServiceProviders.swapMember',
  ResetMembers = 'cddServiceProviders.resetMembers',
  AbdicateMembership = 'cddServiceProviders.abdicateMembership',
}

export type TxTag =
  | SystemTx
  | TimestampTx
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
  | MipsTx
  | AssetTx
  | BridgeTx
  | DividendTx
  | IdentityTx
  | GeneralTmTx
  | VotingTx
  | StoCappedTx
  | PercentageTmTx
  | ExemptionTx
  | SimpleTokenTx
  | CddServiceProvidersTx;

export const TxTags = {
  system: SystemTx,
  timestamp: TimestampTx,
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
  mips: MipsTx,
  asset: AssetTx,
  bridge: BridgeTx,
  dividend: DividendTx,
  identity: IdentityTx,
  generalTM: GeneralTmTx,
  voting: VotingTx,
  stoCapped: StoCappedTx,
  percentageTM: PercentageTmTx,
  exemption: ExemptionTx,
  simpleToken: SimpleTokenTx,
  cddServiceProviders: CddServiceProvidersTx,
};
