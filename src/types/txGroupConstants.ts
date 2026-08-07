import { TxGroup, TxTag, TxTags } from '~/types';

/*
 * A transaction belongs in a group only if the chain resolves its origin through a call-permission
 * check (`ensure_origin_call_permissions`, `ensure_perms`, `ensure_valid_origin`, or an external
 * agent check), since those are the only paths that consult a signer's `ExtrinsicPermissions`.
 * Calls gated by `ensure_signed`, `ensure_root`, `ensure_did` or `ensure_primary_key` ignore
 * permissions, so granting them would have no effect. The check may sit behind a delegation, so
 * follow the call through before concluding.
 */

/**
 * Transaction tags for Advanced Asset Management operations
 * Contains asset freeze/unfreeze, controller transfer, and NFT management operations.
 *
 * Values:
 * - TxTags.asset.AcceptAssetOwnershipTransfer
 * - TxTags.asset.ControllerTransfer
 * - TxTags.asset.Freeze
 * - TxTags.asset.Unfreeze
 * - TxTags.nft.ControllerTransfer
 *
 * @note AcceptAssetOwnershipTransfer has unique permission checking - it verifies that the identity
 * that created the authorization was an agent with AcceptAssetOwnershipTransfer permission so an agent with this
 * permission can transfer the ownership of the asset.
 */
export const ADVANCED_ASSET_MANAGEMENT_TX_TAGS = [
  TxTags.asset.AcceptAssetOwnershipTransfer, // Agent (via authorization creator check)
  TxTags.asset.ControllerTransfer, // Agent
  TxTags.asset.Freeze, // Agent
  TxTags.asset.Unfreeze, // Agent
  TxTags.nft.ControllerTransfer, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Asset Management operations
 * Contains basic asset management operations like divisibility, linking, and metadata.
 *
 * Values:
 * - TxTags.asset.LinkTickerToAssetId
 * - TxTags.asset.MakeDivisible
 * - TxTags.asset.RenameAsset
 * - TxTags.asset.SetFundingRound
 * - TxTags.asset.UnlinkTickerFromAssetId
 * - TxTags.asset.UpdateAssetType
 * - TxTags.asset.UpdateIdentifiers
 */
export const ASSET_MANAGEMENT_TX_TAGS = [
  TxTags.asset.LinkTickerToAssetId, // Agent
  TxTags.asset.MakeDivisible, // Agent
  TxTags.asset.RenameAsset, // Agent
  TxTags.asset.SetFundingRound, // Agent
  TxTags.asset.UnlinkTickerFromAssetId, // Agent
  TxTags.asset.UpdateAssetType, // Agent
  TxTags.asset.UpdateIdentifiers, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Asset Document Management operations
 * Contains operations for managing asset documents.
 *
 * Values:
 * - TxTags.asset.AddDocuments
 * - TxTags.asset.RemoveDocuments
 */
export const ASSET_DOCUMENT_MANAGEMENT_TX_TAGS = [
  TxTags.asset.AddDocuments, // Agent
  TxTags.asset.RemoveDocuments, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Asset Metadata Management operations
 * Contains operations for managing asset metadata.
 *
 * Values:
 * - TxTags.asset.RegisterAndSetLocalAssetMetadata
 * - TxTags.asset.RegisterAssetMetadataLocalType
 * - TxTags.asset.RemoveLocalMetadataKey
 * - TxTags.asset.RemoveMetadataValue
 */
export const ASSET_METADATA_MANAGEMENT_TX_TAGS = [
  TxTags.asset.RegisterAndSetLocalAssetMetadata, // Agent
  TxTags.asset.RegisterAssetMetadataLocalType, // Agent
  TxTags.asset.RemoveLocalMetadataKey, // Agent
  TxTags.asset.RemoveMetadataValue, // Agent
  TxTags.asset.SetAssetMetadata, // Agent
  TxTags.asset.SetAssetMetadataDetails, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Asset Registration operations
 * Contains operations for registering assets, custom types, and NFT collections.
 *
 * Values:
 * - TxTags.asset.AcceptAssetOwnershipTransfer
 * - TxTags.asset.AcceptTickerTransfer
 * - TxTags.asset.CreateAsset
 * - TxTags.asset.CreateAssetWithCustomType
 * - TxTags.asset.RegisterCustomAssetType
 * - TxTags.asset.RegisterUniqueTicker
 * - TxTags.nft.CreateNftCollection
 */
export const ASSET_REGISTRATION_TX_TAGS = [
  TxTags.asset.AcceptAssetOwnershipTransfer, // Secondary Key
  TxTags.asset.AcceptTickerTransfer, // Secondary Key
  TxTags.asset.CreateAsset, // Secondary Key
  TxTags.asset.CreateAssetWithCustomType, // Secondary Key
  TxTags.asset.RegisterCustomAssetType, // Secondary Key
  TxTags.asset.RegisterUniqueTicker, // Secondary Key
  TxTags.nft.CreateNftCollection, // Agent (or Secondary Key if new asset)
] as const satisfies TxTag[];

/**
 * Transaction tags for Authorization Management operations
 * Contains operations for managing identity authorizations.
 *
 * Values:
 * - TxTags.identity.AddAuthorization
 * - TxTags.identity.RemoveAuthorization
 */
export const AUTHORIZATION_MANAGEMENT_TX_TAGS = [
  TxTags.identity.AddAuthorization, // Secondary Key
  TxTags.identity.RemoveAuthorization, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Capital Distribution operations
 * Contains operations for managing capital distributions.
 *
 * Values:
 * - TxTags.capitalDistribution.Distribute
 * - TxTags.capitalDistribution.PushBenefit
 * - TxTags.capitalDistribution.Reclaim
 * - TxTags.capitalDistribution.RemoveDistribution
 */
export const CAPITAL_DISTRIBUTION_TX_TAGS = [
  TxTags.capitalDistribution.Distribute, // Agent
  TxTags.capitalDistribution.PushBenefit, // Agent
  TxTags.capitalDistribution.Reclaim, // Agent
  TxTags.capitalDistribution.RemoveDistribution, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for CDD Registration operations
 * Contains operations for Customer Due Diligence registration.
 *
 * Values:
 * - TxTags.identity.CddRegisterDid
 * - TxTags.identity.CddRegisterDidWithCdd
 *
 * @deprecated these extrinsics no longer attach a `CustomerDueDiligence` claim as of chain v8.
 *   Use {@link DID_REGISTRATION_TX_TAGS} instead
 */
export const CDD_REGISTRATION_TX_TAGS = [
  TxTags.identity.CddRegisterDid, // Secondary Key
  TxTags.identity.CddRegisterDidWithCdd, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for DID Registration operations
 * Contains registrar-gated DID registration, superseding CDD registration.
 *
 * Values:
 * - TxTags.identity.RegisterDid
 */
export const DID_REGISTRATION_TX_TAGS = [
  TxTags.identity.RegisterDid, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Checkpoint Management operations
 * Contains operations for creating and managing asset checkpoints.
 *
 * Values:
 * - TxTags.checkpoint.CreateCheckpoint
 * - TxTags.checkpoint.CreateSchedule
 * - TxTags.checkpoint.RemoveSchedule
 */
export const CHECKPOINT_MANAGEMENT_TX_TAGS = [
  TxTags.checkpoint.CreateCheckpoint, // Agent
  TxTags.checkpoint.CreateSchedule, // Agent
  TxTags.checkpoint.RemoveSchedule, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Claims Management operations
 * Contains operations for adding, revoking, and managing identity claims.
 *
 * Values:
 * - TxTags.identity.AddClaim
 * - TxTags.identity.RegisterCustomClaimType
 * - TxTags.identity.RevokeClaim
 * - TxTags.identity.RevokeClaimByIndex
 */
export const CLAIMS_MANAGEMENT_TX_TAGS = [
  TxTags.identity.AddClaim, // Secondary Key
  TxTags.identity.RegisterCustomClaimType, // Secondary Key
  TxTags.identity.RevokeClaim, // Secondary Key
  TxTags.identity.RevokeClaimByIndex, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Compliance Management operations
 * Contains comprehensive compliance management operations.
 *
 * Values:
 * - TxTags.asset.AddMandatoryMediators
 * - TxTags.asset.RemoveMandatoryMediators
 * - TxTags.complianceManager.AddComplianceRequirement
 * - TxTags.complianceManager.ChangeComplianceRequirement
 * - TxTags.complianceManager.PauseAssetCompliance
 * - TxTags.complianceManager.RemoveComplianceRequirement
 * - TxTags.complianceManager.ReplaceAssetCompliance
 * - TxTags.complianceManager.ResetAssetCompliance
 * - TxTags.complianceManager.ResumeAssetCompliance
 * - TxTags.settlement.AllowVenues
 * - TxTags.settlement.DisallowVenues
 * - TxTags.settlement.SetVenueFiltering
 * - TxTags.statistics.BatchUpdateAssetStats
 * - TxTags.statistics.SetActiveAssetStats
 * - TxTags.statistics.SetAssetTransferCompliance
 * - TxTags.statistics.SetEntitiesExempt
 */
export const COMPLIANCE_MANAGEMENT_TX_TAGS = [
  TxTags.asset.AddMandatoryMediators, // Agent
  TxTags.asset.RemoveMandatoryMediators, // Agent
  TxTags.complianceManager.AddComplianceRequirement, // Agent
  TxTags.complianceManager.ChangeComplianceRequirement, // Agent
  TxTags.complianceManager.PauseAssetCompliance, // Agent
  TxTags.complianceManager.RemoveComplianceRequirement, // Agent
  TxTags.complianceManager.ReplaceAssetCompliance, // Agent
  TxTags.complianceManager.ResetAssetCompliance, // Agent
  TxTags.complianceManager.ResumeAssetCompliance, // Agent
  TxTags.settlement.AllowVenues, // Agent
  TxTags.settlement.DisallowVenues, // Agent
  TxTags.settlement.SetVenueFiltering, // Agent
  TxTags.statistics.BatchUpdateAssetStats, // Agent
  TxTags.statistics.SetActiveAssetStats, // Agent
  TxTags.statistics.SetAssetTransferCompliance, // Agent
  TxTags.statistics.SetEntitiesExempt, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Corporate Actions Management operations
 * Contains operations for managing corporate actions.
 *
 * Values:
 * - TxTags.corporateAction.ChangeRecordDate
 * - TxTags.corporateAction.InitiateCorporateAction
 * - TxTags.corporateAction.InitiateCorporateActionAndDistribute
 * - TxTags.corporateAction.LinkCaDoc
 * - TxTags.corporateAction.RemoveCa
 * - TxTags.corporateAction.SetDefaultTargets
 * - TxTags.corporateAction.SetDefaultWithholdingTax
 * - TxTags.corporateAction.SetDidWithholdingTax
 */
export const CORPORATE_ACTIONS_MANAGEMENT_TX_TAGS = [
  TxTags.corporateAction.ChangeRecordDate, // Agent
  TxTags.corporateAction.InitiateCorporateAction, // Agent
  TxTags.corporateAction.InitiateCorporateActionAndBallot, // Agent
  TxTags.corporateAction.InitiateCorporateActionAndDistribute, // Agent
  TxTags.corporateAction.LinkCaDoc, // Agent
  TxTags.corporateAction.RemoveCa, // Agent
  TxTags.corporateAction.SetDefaultTargets, // Agent
  TxTags.corporateAction.SetDefaultWithholdingTax, // Agent
  TxTags.corporateAction.SetDidWithholdingTax, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Corporate Ballot Management operations
 * Contains operations for managing corporate ballots.
 *
 * Values:
 * - TxTags.corporateBallot.AttachBallot
 * - TxTags.corporateBallot.ChangeEnd
 * - TxTags.corporateBallot.ChangeMeta
 * - TxTags.corporateBallot.ChangeRcv
 * - TxTags.corporateBallot.RemoveBallot
 */
export const CORPORATE_BALLOT_MANAGEMENT_TX_TAGS = [
  TxTags.corporateBallot.AttachBallot, // Agent
  TxTags.corporateBallot.ChangeEnd, // Agent
  TxTags.corporateBallot.ChangeMeta, // Agent
  TxTags.corporateBallot.ChangeRcv, // Agent
  TxTags.corporateBallot.RemoveBallot, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Corporate Voting operations
 * Contains operations for voting in corporate ballots.
 *
 * Values:
 * - TxTags.corporateBallot.Vote
 */
export const CORPORATE_VOTING_TX_TAGS = [
  TxTags.corporateBallot.Vote, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for External Agent Management operations
 * Contains operations for managing external agents and their permissions.
 *
 * Values:
 * - TxTags.externalAgents.ChangeGroup
 * - TxTags.externalAgents.CreateAndChangeCustomGroup
 * - TxTags.externalAgents.CreateGroup
 * - TxTags.externalAgents.CreateGroupAndAddAuth
 * - TxTags.externalAgents.RemoveAgent
 * - TxTags.externalAgents.SetGroupPermissions
 */
export const EXTERNAL_AGENT_MANAGEMENT_TX_TAGS = [
  TxTags.externalAgents.ChangeGroup, // Agent
  TxTags.externalAgents.CreateAndChangeCustomGroup, // Agent
  TxTags.externalAgents.CreateGroup, // Agent
  TxTags.externalAgents.CreateGroupAndAddAuth, // Agent
  TxTags.externalAgents.RemoveAgent, // Agent
  TxTags.externalAgents.SetGroupPermissions, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for External Agent Participation operations
 * Contains operations for joining and leaving external agent roles.
 *
 * Values:
 * - TxTags.externalAgents.Abdicate
 * - TxTags.externalAgents.AcceptBecomeAgent
 */
export const EXTERNAL_AGENT_PARTICIPATION_TX_TAGS = [
  TxTags.externalAgents.Abdicate, // Secondary Key (self-removal)
  TxTags.externalAgents.AcceptBecomeAgent, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Settlement Management operations
 * Contains comprehensive settlement instruction, venue management, asset pre-approval, and investment operations.
 *
 * Values:
 * - TxTags.asset.Approve
 * - TxTags.asset.PreApproveAsset
 * - TxTags.asset.ReceiverAffirmAssetTransfer
 * - TxTags.asset.RejectAssetTransfer
 * - TxTags.asset.RemoveAssetPreApproval
 * - TxTags.asset.TransferAsset
 * - TxTags.capitalDistribution.Claim
 * - TxTags.nft.TransferNft
 * - TxTags.portfolio.PreApprovePortfolio
 * - TxTags.portfolio.RemovePortfolioPreApproval
 * - TxTags.settlement.AddAndAffirmInstruction
 * - TxTags.settlement.AddAndAffirmWithMediators
 * - TxTags.settlement.AddInstruction
 * - TxTags.settlement.AddInstructionWithMediators
 * - TxTags.settlement.AffirmInstruction
 * - TxTags.settlement.AffirmInstructionWithCount
 * - TxTags.settlement.AffirmWithReceipts
 * - TxTags.settlement.AffirmWithReceiptsWithCount
 * - TxTags.settlement.CreateVenue
 * - TxTags.settlement.ExecuteManualInstruction
 * - TxTags.settlement.RejectInstruction
 * - TxTags.settlement.RejectInstructionWithCount
 * - TxTags.settlement.SetMandatoryReceiverAffirmation
 * - TxTags.settlement.TransferFunds
 * - TxTags.settlement.UpdateVenueDetails
 * - TxTags.settlement.UpdateVenueSigners
 * - TxTags.settlement.UpdateVenueType
 * - TxTags.sto.Invest
 */
export const SETTLEMENT_MANAGEMENT_TX_TAGS = [
  TxTags.asset.Approve, // Secondary Key
  TxTags.asset.PreApproveAsset, // Secondary Key
  TxTags.asset.ReceiverAffirmAssetTransfer, // Secondary Key
  TxTags.asset.RejectAssetTransfer, // Secondary Key
  TxTags.asset.RemoveAssetPreApproval, // Secondary Key
  TxTags.asset.TransferAsset, // Secondary Key
  TxTags.capitalDistribution.Claim, // Secondary Key
  TxTags.nft.TransferNft, // Secondary Key
  TxTags.portfolio.PreApprovePortfolio, // Secondary Key
  TxTags.portfolio.RemovePortfolioPreApproval, // Secondary Key
  TxTags.settlement.AddAndAffirmInstruction, // Secondary Key
  TxTags.settlement.AddAndAffirmWithMediators, // Secondary Key
  TxTags.settlement.AddInstruction, // Secondary Key
  TxTags.settlement.AddInstructionWithMediators, // Secondary Key
  TxTags.settlement.AffirmInstruction, // Secondary Key
  TxTags.settlement.AffirmInstructionWithCount, // Secondary Key
  TxTags.settlement.AffirmWithReceipts, // Secondary Key
  TxTags.settlement.AffirmWithReceiptsWithCount, // Secondary Key
  TxTags.settlement.CreateVenue, // Secondary Key
  TxTags.settlement.ExecuteManualInstruction, // Secondary Key
  TxTags.settlement.RejectInstruction, // Secondary Key
  TxTags.settlement.RejectInstructionWithCount, // Secondary Key
  TxTags.settlement.SetMandatoryReceiverAffirmation, // Secondary Key
  TxTags.settlement.TransferFunds, // Secondary Key
  TxTags.settlement.UpdateVenueDetails, // Secondary Key
  TxTags.settlement.UpdateVenueSigners, // Secondary Key
  TxTags.settlement.UpdateVenueType, // Secondary Key
  TxTags.sto.Invest, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Instruction Mediation operations
 * Contains the operations available to an Instruction's mediators — affirming or rejecting as a
 * mediator, and locking/unlocking an Instruction for execution.
 *
 * Values:
 * - TxTags.settlement.AffirmInstructionAsMediator
 * - TxTags.settlement.LockInstruction
 * - TxTags.settlement.RejectInstructionAsMediator
 * - TxTags.settlement.UnlockInstruction
 */
export const INSTRUCTION_MEDIATION_TX_TAGS = [
  TxTags.settlement.AffirmInstructionAsMediator, // Secondary Key
  TxTags.settlement.LockInstruction, // Secondary Key
  TxTags.settlement.RejectInstructionAsMediator, // Secondary Key
  TxTags.settlement.UnlockInstruction, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Issuance operations
 * Contains fungible asset and NFT issuance operations.
 *
 * Values:
 * - TxTags.asset.Issue
 * - TxTags.nft.IssueNft
 */
export const ISSUANCE_TX_TAGS = [
  TxTags.asset.Issue, // Agent
  TxTags.nft.IssueNft, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for MultiSig Management operations
 * Contains operations for managing multi-signature accounts.
 *
 * Values:
 * - TxTags.multiSig.CreateMultisig
 *
 * @note a MultiSig executes proposals under its own origin, so what it may do via proposal is
 *   constrained by the permissions held by the MultiSig Account itself, not by those of its
 *   signers. Those permissions are drawn from these same groups
 */
export const MULTISIG_MANAGEMENT_TX_TAGS = [
  TxTags.multiSig.CreateMultisig, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Portfolio Management operations
 * Contains comprehensive portfolio management including creation, custody, movement, and operations.
 *
 * Values:
 * - TxTags.portfolio.AcceptPortfolioCustody
 * - TxTags.portfolio.AllowIdentityToCreatePortfolios
 * - TxTags.portfolio.CreateCustodyPortfolio
 * - TxTags.portfolio.CreatePortfolio
 * - TxTags.portfolio.DeletePortfolio
 * - TxTags.portfolio.MovePortfolioFunds
 * - TxTags.portfolio.QuitPortfolioCustody
 * - TxTags.portfolio.RenamePortfolio
 * - TxTags.portfolio.RevokeCreatePortfoliosPermission
 */
export const PORTFOLIO_MANAGEMENT_TX_TAGS = [
  TxTags.portfolio.AcceptPortfolioCustody, // Secondary Key
  TxTags.portfolio.AllowIdentityToCreatePortfolios, // Secondary Key
  TxTags.portfolio.CreateCustodyPortfolio, // Secondary Key
  TxTags.portfolio.CreatePortfolio, // Secondary Key
  TxTags.portfolio.DeletePortfolio, // Secondary Key
  TxTags.portfolio.MovePortfolioFunds, // Secondary Key
  TxTags.portfolio.QuitPortfolioCustody, // Secondary Key
  TxTags.portfolio.RenamePortfolio, // Secondary Key
  TxTags.portfolio.RevokeCreatePortfoliosPermission, // Secondary Key
] as const satisfies TxTag[];

/**
 * Transaction tags for Redemption operations
 * Contains fungible asset and NFT redemption operations.
 *
 * Values:
 * - TxTags.asset.Redeem
 * - TxTags.nft.RedeemNft
 */
export const REDEMPTION_TX_TAGS = [
  TxTags.asset.Redeem, // Agent
  TxTags.nft.RedeemNft, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for STO Management operations
 * Contains operations for Security Token Offerings management.
 *
 * Values:
 * - TxTags.sto.CreateFundraiser
 * - TxTags.sto.EnableOffchainFunding
 * - TxTags.sto.FreezeFundraiser
 * - TxTags.sto.ModifyFundraiserWindow
 * - TxTags.sto.Stop
 * - TxTags.sto.UnfreezeFundraiser
 */
export const STO_MANAGEMENT_TX_TAGS = [
  TxTags.sto.CreateFundraiser, // Agent
  TxTags.sto.EnableOffchainFunding, // Agent
  TxTags.sto.FreezeFundraiser, // Agent
  TxTags.sto.ModifyFundraiserWindow, // Agent
  TxTags.sto.Stop, // Agent
  TxTags.sto.UnfreezeFundraiser, // Agent
] as const satisfies TxTag[];

/**
 * Transaction tags for Trusted Claim Issuers Management operations
 * Contains operations for managing trusted claim issuers.
 *
 * Values:
 * - TxTags.complianceManager.AddDefaultTrustedClaimIssuer
 * - TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer
 */
export const TRUSTED_CLAIM_ISSUERS_MANAGEMENT_TX_TAGS = [
  TxTags.complianceManager.AddDefaultTrustedClaimIssuer, // Agent
  TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer, // Agent
] as const satisfies TxTag[];

/**
 * Mapping of transaction groups to their corresponding transaction tags
 * Used by txGroupToTxTags function for efficient lookups
 * Groups are ordered alphabetically for maintainability
 */
export const TX_GROUP_TO_TAGS_MAP: Record<TxGroup, TxTag[]> = {
  [TxGroup.AdvancedAssetManagement]: ADVANCED_ASSET_MANAGEMENT_TX_TAGS,
  [TxGroup.AssetDocumentManagement]: ASSET_DOCUMENT_MANAGEMENT_TX_TAGS,
  [TxGroup.AssetManagement]: ASSET_MANAGEMENT_TX_TAGS,
  [TxGroup.AssetMetadataManagement]: ASSET_METADATA_MANAGEMENT_TX_TAGS,
  [TxGroup.AssetRegistration]: ASSET_REGISTRATION_TX_TAGS,
  [TxGroup.AuthorizationManagement]: AUTHORIZATION_MANAGEMENT_TX_TAGS,
  [TxGroup.CapitalDistribution]: CAPITAL_DISTRIBUTION_TX_TAGS,
  [TxGroup.CddRegistration]: CDD_REGISTRATION_TX_TAGS,
  [TxGroup.CheckpointManagement]: CHECKPOINT_MANAGEMENT_TX_TAGS,
  [TxGroup.ClaimsManagement]: CLAIMS_MANAGEMENT_TX_TAGS,
  [TxGroup.ComplianceManagement]: COMPLIANCE_MANAGEMENT_TX_TAGS,
  [TxGroup.CorporateActionsManagement]: CORPORATE_ACTIONS_MANAGEMENT_TX_TAGS,
  [TxGroup.CorporateBallotManagement]: CORPORATE_BALLOT_MANAGEMENT_TX_TAGS,
  [TxGroup.CorporateVoting]: CORPORATE_VOTING_TX_TAGS,
  [TxGroup.DidRegistration]: DID_REGISTRATION_TX_TAGS,
  [TxGroup.ExternalAgentManagement]: EXTERNAL_AGENT_MANAGEMENT_TX_TAGS,
  [TxGroup.InstructionMediation]: INSTRUCTION_MEDIATION_TX_TAGS,
  [TxGroup.ExternalAgentParticipation]: EXTERNAL_AGENT_PARTICIPATION_TX_TAGS,
  [TxGroup.Issuance]: ISSUANCE_TX_TAGS,
  [TxGroup.MultiSigManagement]: MULTISIG_MANAGEMENT_TX_TAGS,
  [TxGroup.PortfolioManagement]: PORTFOLIO_MANAGEMENT_TX_TAGS,
  [TxGroup.Redemption]: REDEMPTION_TX_TAGS,
  [TxGroup.SettlementManagement]: SETTLEMENT_MANAGEMENT_TX_TAGS,
  [TxGroup.StoManagement]: STO_MANAGEMENT_TX_TAGS,
  [TxGroup.TrustedClaimIssuersManagement]: TRUSTED_CLAIM_ISSUERS_MANAGEMENT_TX_TAGS,
};

/**
 * Runtime list of `TxGroup` values that are permitted for External Agent permissions.
 *
 * - Pairs with {@link api/procedures/types!AgentTxGroup} for compile-time safety.
 * - Use this constant when you need to iterate, validate, or render the allowed groups at runtime
 *   without duplicating definitions.
 * - All transactions in these groups are available to both Agents and Secondary Keys.
 * - Groups are ordered alphabetically for consistency.
 *
 * @example Iterate allowed agent groups and retrieve their transactions
 * ```ts
 * AGENT_TX_GROUP_VALUES.forEach(group => {
 *   const tags = txGroupToTxTags(group);
 *   // render group with its tags, build UI options, etc.
 * });
 * ```
 */
export const AGENT_TX_GROUP_VALUES = [
  TxGroup.AdvancedAssetManagement,
  TxGroup.AssetDocumentManagement,
  TxGroup.AssetManagement,
  TxGroup.AssetMetadataManagement,
  TxGroup.CapitalDistribution,
  TxGroup.CheckpointManagement,
  TxGroup.ComplianceManagement,
  TxGroup.CorporateActionsManagement,
  TxGroup.CorporateBallotManagement,
  TxGroup.ExternalAgentManagement,
  TxGroup.Issuance,
  TxGroup.Redemption,
  TxGroup.StoManagement,
  TxGroup.TrustedClaimIssuersManagement,
] as const satisfies readonly TxGroup[];
