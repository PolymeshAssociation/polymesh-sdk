# Module: api/entities/types

## Table of contents

### References

- [AccountBalance](../wiki/api.entities.types#accountbalance)
- [AccountIdentityRelation](../wiki/api.entities.types#accountidentityrelation)
- [AccountKeyType](../wiki/api.entities.types#accountkeytype)
- [AccountTypeInfo](../wiki/api.entities.types#accounttypeinfo)
- [AffirmationStatus](../wiki/api.entities.types#affirmationstatus)
- [AgentWithGroup](../wiki/api.entities.types#agentwithgroup)
- [AnyJson](../wiki/api.entities.types#anyjson)
- [Asset](../wiki/api.entities.types#asset)
- [AssetDetails](../wiki/api.entities.types#assetdetails)
- [AssetDocument](../wiki/api.entities.types#assetdocument)
- [AssetWithGroup](../wiki/api.entities.types#assetwithgroup)
- [Balance](../wiki/api.entities.types#balance)
- [BaseHistoricAssetTransaction](../wiki/api.entities.types#basehistoricassettransaction)
- [CaCheckpointType](../wiki/api.entities.types#cacheckpointtype)
- [CheckpointScheduleParams](../wiki/api.entities.types#checkpointscheduleparams)
- [CollectionKey](../wiki/api.entities.types#collectionkey)
- [CorporateActionDefaultConfig](../wiki/api.entities.types#corporateactiondefaultconfig)
- [CorporateActionKind](../wiki/api.entities.types#corporateactionkind)
- [CorporateActionParams](../wiki/api.entities.types#corporateactionparams)
- [CorporateActionTargets](../wiki/api.entities.types#corporateactiontargets)
- [DistributionParticipant](../wiki/api.entities.types#distributionparticipant)
- [DividendDistributionDetails](../wiki/api.entities.types#dividenddistributiondetails)
- [DividendDistributionParams](../wiki/api.entities.types#dividenddistributionparams)
- [FungibleLeg](../wiki/api.entities.types#fungibleleg)
- [GlobalMetadataKey](../wiki/api.entities.types#globalmetadatakey)
- [GroupedInstructions](../wiki/api.entities.types#groupedinstructions)
- [GroupedInvolvedInstructions](../wiki/api.entities.types#groupedinvolvedinstructions)
- [HeldNfts](../wiki/api.entities.types#heldnfts)
- [HistoricAgentOperation](../wiki/api.entities.types#historicagentoperation)
- [HistoricAssetTransaction](../wiki/api.entities.types#historicassettransaction)
- [HistoricInstruction](../wiki/api.entities.types#historicinstruction)
- [HistoricNftTransaction](../wiki/api.entities.types#historicnfttransaction)
- [HistoricPolyxTransaction](../wiki/api.entities.types#historicpolyxtransaction)
- [HistoricSettlement](../wiki/api.entities.types#historicsettlement)
- [IdentityBalance](../wiki/api.entities.types#identitybalance)
- [IdentityHeldNfts](../wiki/api.entities.types#identityheldnfts)
- [InputCaCheckpoint](../wiki/api.entities.types#inputcacheckpoint)
- [InputTargets](../wiki/api.entities.types#inputtargets)
- [InputTaxWithholding](../wiki/api.entities.types#inputtaxwithholding)
- [InstructionAffirmation](../wiki/api.entities.types#instructionaffirmation)
- [InstructionDetails](../wiki/api.entities.types#instructiondetails)
- [InstructionEndCondition](../wiki/api.entities.types#instructionendcondition)
- [InstructionStatus](../wiki/api.entities.types#instructionstatus)
- [InstructionStatusResult](../wiki/api.entities.types#instructionstatusresult)
- [InstructionType](../wiki/api.entities.types#instructiontype)
- [InstructionsByStatus](../wiki/api.entities.types#instructionsbystatus)
- [Investment](../wiki/api.entities.types#investment)
- [KnownAssetType](../wiki/api.entities.types#knownassettype)
- [KnownNftType](../wiki/api.entities.types#knownnfttype)
- [Leg](../wiki/api.entities.types#leg)
- [MediatorAffirmation](../wiki/api.entities.types#mediatoraffirmation)
- [MetadataDetails](../wiki/api.entities.types#metadatadetails)
- [MetadataKeyId](../wiki/api.entities.types#metadatakeyid)
- [MetadataLockStatus](../wiki/api.entities.types#metadatalockstatus)
- [MetadataSpec](../wiki/api.entities.types#metadataspec)
- [MetadataType](../wiki/api.entities.types#metadatatype)
- [MetadataValue](../wiki/api.entities.types#metadatavalue)
- [MetadataValueDetails](../wiki/api.entities.types#metadatavaluedetails)
- [MetadataWithValue](../wiki/api.entities.types#metadatawithvalue)
- [MultiSigDetails](../wiki/api.entities.types#multisigdetails)
- [MultiSigProposalAction](../wiki/api.entities.types#multisigproposalaction)
- [MultiSigProposalDetails](../wiki/api.entities.types#multisigproposaldetails)
- [MultiSigProposalVote](../wiki/api.entities.types#multisigproposalvote)
- [MultiSigSigners](../wiki/api.entities.types#multisigsigners)
- [NftLeg](../wiki/api.entities.types#nftleg)
- [NftMetadata](../wiki/api.entities.types#nftmetadata)
- [OffChainAffirmation](../wiki/api.entities.types#offchainaffirmation)
- [OffChainLeg](../wiki/api.entities.types#offchainleg)
- [OfferingBalanceStatus](../wiki/api.entities.types#offeringbalancestatus)
- [OfferingDetails](../wiki/api.entities.types#offeringdetails)
- [OfferingSaleStatus](../wiki/api.entities.types#offeringsalestatus)
- [OfferingStatus](../wiki/api.entities.types#offeringstatus)
- [OfferingTier](../wiki/api.entities.types#offeringtier)
- [OfferingTimingStatus](../wiki/api.entities.types#offeringtimingstatus)
- [PortfolioBalance](../wiki/api.entities.types#portfoliobalance)
- [PortfolioCollection](../wiki/api.entities.types#portfoliocollection)
- [ProposalStatus](../wiki/api.entities.types#proposalstatus)
- [ScheduleDetails](../wiki/api.entities.types#scheduledetails)
- [SecurityIdentifier](../wiki/api.entities.types#securityidentifier)
- [SecurityIdentifierType](../wiki/api.entities.types#securityidentifiertype)
- [SettlementLeg](../wiki/api.entities.types#settlementleg)
- [SubsidyData](../wiki/api.entities.types#subsidydata)
- [SubsidyWithAllowance](../wiki/api.entities.types#subsidywithallowance)
- [TargetTreatment](../wiki/api.entities.types#targettreatment)
- [TaxWithholding](../wiki/api.entities.types#taxwithholding)
- [TickerReservationDetails](../wiki/api.entities.types#tickerreservationdetails)
- [TickerReservationStatus](../wiki/api.entities.types#tickerreservationstatus)
- [Tier](../wiki/api.entities.types#tier)
- [TransferBreakdown](../wiki/api.entities.types#transferbreakdown)
- [TransferError](../wiki/api.entities.types#transfererror)
- [TransferRestrictionResult](../wiki/api.entities.types#transferrestrictionresult)
- [TransferStatus](../wiki/api.entities.types#transferstatus)
- [UniqueIdentifiers](../wiki/api.entities.types#uniqueidentifiers)
- [VenueDetails](../wiki/api.entities.types#venuedetails)
- [VenueFilteringDetails](../wiki/api.entities.types#venuefilteringdetails)
- [VenueType](../wiki/api.entities.types#venuetype)

### Enumerations

- [AuthorizationType](../wiki/api.entities.types.AuthorizationType)
- [ClaimType](../wiki/api.entities.types.ClaimType)
- [ConditionTarget](../wiki/api.entities.types.ConditionTarget)
- [ConditionType](../wiki/api.entities.types.ConditionType)
- [PermissionGroupType](../wiki/api.entities.types.PermissionGroupType)
- [PermissionType](../wiki/api.entities.types.PermissionType)
- [ScopeType](../wiki/api.entities.types.ScopeType)
- [SignerType](../wiki/api.entities.types.SignerType)
- [StatType](../wiki/api.entities.types.StatType)

### Interfaces

- [AccreditedClaim](../wiki/api.entities.types.AccreditedClaim)
- [ActiveTransferRestrictions](../wiki/api.entities.types.ActiveTransferRestrictions)
- [AddCountStatInput](../wiki/api.entities.types.AddCountStatInput)
- [AffiliateClaim](../wiki/api.entities.types.AffiliateClaim)
- [BlockedClaim](../wiki/api.entities.types.BlockedClaim)
- [BuyLockupClaim](../wiki/api.entities.types.BuyLockupClaim)
- [CddClaim](../wiki/api.entities.types.CddClaim)
- [CheckPermissionsResult](../wiki/api.entities.types.CheckPermissionsResult)
- [CheckRolesResult](../wiki/api.entities.types.CheckRolesResult)
- [CheckpointWithData](../wiki/api.entities.types.CheckpointWithData)
- [ClaimCountTransferRestriction](../wiki/api.entities.types.ClaimCountTransferRestriction)
- [ClaimData](../wiki/api.entities.types.ClaimData)
- [ClaimPercentageTransferRestriction](../wiki/api.entities.types.ClaimPercentageTransferRestriction)
- [ClaimScope](../wiki/api.entities.types.ClaimScope)
- [ClaimTarget](../wiki/api.entities.types.ClaimTarget)
- [Compliance](../wiki/api.entities.types.Compliance)
- [ComplianceRequirements](../wiki/api.entities.types.ComplianceRequirements)
- [ConditionBase](../wiki/api.entities.types.ConditionBase)
- [ConditionCompliance](../wiki/api.entities.types.ConditionCompliance)
- [CountTransferRestriction](../wiki/api.entities.types.CountTransferRestriction)
- [CustomClaim](../wiki/api.entities.types.CustomClaim)
- [DistributionPayment](../wiki/api.entities.types.DistributionPayment)
- [DistributionWithDetails](../wiki/api.entities.types.DistributionWithDetails)
- [ExemptedClaim](../wiki/api.entities.types.ExemptedClaim)
- [ExternalAgentCondition](../wiki/api.entities.types.ExternalAgentCondition)
- [FungiblePortfolioMovement](../wiki/api.entities.types.FungiblePortfolioMovement)
- [IdentityCondition](../wiki/api.entities.types.IdentityCondition)
- [IdentityWithClaims](../wiki/api.entities.types.IdentityWithClaims)
- [JurisdictionClaim](../wiki/api.entities.types.JurisdictionClaim)
- [KycClaim](../wiki/api.entities.types.KycClaim)
- [MultiClaimCondition](../wiki/api.entities.types.MultiClaimCondition)
- [OfferingWithDetails](../wiki/api.entities.types.OfferingWithDetails)
- [PaginationOptions](../wiki/api.entities.types.PaginationOptions)
- [PercentageTransferRestriction](../wiki/api.entities.types.PercentageTransferRestriction)
- [PermissionGroups](../wiki/api.entities.types.PermissionGroups)
- [PermissionedAccount](../wiki/api.entities.types.PermissionedAccount)
- [Permissions](../wiki/api.entities.types.Permissions)
- [Requirement](../wiki/api.entities.types.Requirement)
- [RequirementCompliance](../wiki/api.entities.types.RequirementCompliance)
- [ResultSet](../wiki/api.entities.types.ResultSet)
- [ScheduleWithDetails](../wiki/api.entities.types.ScheduleWithDetails)
- [Scope](../wiki/api.entities.types.Scope)
- [SectionPermissions](../wiki/api.entities.types.SectionPermissions)
- [SellLockupClaim](../wiki/api.entities.types.SellLockupClaim)
- [SignerValue](../wiki/api.entities.types.SignerValue)
- [SimplePermissions](../wiki/api.entities.types.SimplePermissions)
- [SingleClaimCondition](../wiki/api.entities.types.SingleClaimCondition)
- [StatAccreditedClaimInput](../wiki/api.entities.types.StatAccreditedClaimInput)
- [StatAffiliateClaimInput](../wiki/api.entities.types.StatAffiliateClaimInput)
- [StatClaimIssuer](../wiki/api.entities.types.StatClaimIssuer)
- [StatJurisdictionClaimInput](../wiki/api.entities.types.StatJurisdictionClaimInput)
- [TransactionPermissions](../wiki/api.entities.types.TransactionPermissions)
- [TrustedClaimIssuer](../wiki/api.entities.types.TrustedClaimIssuer)

### Type Aliases

- [Account](../wiki/api.entities.types#account)
- [ActiveStats](../wiki/api.entities.types#activestats)
- [AddRelayerPayingKeyAuthorizationData](../wiki/api.entities.types#addrelayerpayingkeyauthorizationdata)
- [AttestPrimaryKeyRotationAuthorizationData](../wiki/api.entities.types#attestprimarykeyrotationauthorizationdata)
- [Authorization](../wiki/api.entities.types#authorization)
- [AuthorizationRequest](../wiki/api.entities.types#authorizationrequest)
- [BecomeAgentAuthorizationData](../wiki/api.entities.types#becomeagentauthorizationdata)
- [Checkpoint](../wiki/api.entities.types#checkpoint)
- [CheckpointSchedule](../wiki/api.entities.types#checkpointschedule)
- [ChildIdentity](../wiki/api.entities.types#childidentity)
- [Claim](../wiki/api.entities.types#claim)
- [ClaimCountStatInput](../wiki/api.entities.types#claimcountstatinput)
- [Condition](../wiki/api.entities.types#condition)
- [CorporateAction](../wiki/api.entities.types#corporateaction)
- [CustomClaimWithoutScope](../wiki/api.entities.types#customclaimwithoutscope)
- [CustomPermissionGroup](../wiki/api.entities.types#custompermissiongroup)
- [DefaultPortfolio](../wiki/api.entities.types#defaultportfolio)
- [DefaultTrustedClaimIssuer](../wiki/api.entities.types#defaulttrustedclaimissuer)
- [DividendDistribution](../wiki/api.entities.types#dividenddistribution)
- [FungibleAsset](../wiki/api.entities.types#fungibleasset)
- [GenericAuthorizationData](../wiki/api.entities.types#genericauthorizationdata)
- [GroupPermissions](../wiki/api.entities.types#grouppermissions)
- [Identity](../wiki/api.entities.types#identity)
- [InputCondition](../wiki/api.entities.types#inputcondition)
- [InputConditionBase](../wiki/api.entities.types#inputconditionbase)
- [InputRequirement](../wiki/api.entities.types#inputrequirement)
- [InputStatClaim](../wiki/api.entities.types#inputstatclaim)
- [InputStatType](../wiki/api.entities.types#inputstattype)
- [InputTrustedClaimIssuer](../wiki/api.entities.types#inputtrustedclaimissuer)
- [Instruction](../wiki/api.entities.types#instruction)
- [JoinIdentityAuthorizationData](../wiki/api.entities.types#joinidentityauthorizationdata)
- [KnownPermissionGroup](../wiki/api.entities.types#knownpermissiongroup)
- [MetadataEntry](../wiki/api.entities.types#metadataentry)
- [MultiSig](../wiki/api.entities.types#multisig)
- [MultiSigProposal](../wiki/api.entities.types#multisigproposal)
- [NextKey](../wiki/api.entities.types#nextkey)
- [Nft](../wiki/api.entities.types#nft)
- [NftCollection](../wiki/api.entities.types#nftcollection)
- [NonFungiblePortfolioMovement](../wiki/api.entities.types#nonfungibleportfoliomovement)
- [NumberedPortfolio](../wiki/api.entities.types#numberedportfolio)
- [Offering](../wiki/api.entities.types#offering)
- [PermissionsLike](../wiki/api.entities.types#permissionslike)
- [PortfolioCustodyAuthorizationData](../wiki/api.entities.types#portfoliocustodyauthorizationdata)
- [PortfolioLike](../wiki/api.entities.types#portfoliolike)
- [PortfolioMovement](../wiki/api.entities.types#portfoliomovement)
- [RotatePrimaryKeyAuthorizationData](../wiki/api.entities.types#rotateprimarykeyauthorizationdata)
- [RotatePrimaryKeyToSecondaryData](../wiki/api.entities.types#rotateprimarykeytosecondarydata)
- [ScopedClaim](../wiki/api.entities.types#scopedclaim)
- [Signer](../wiki/api.entities.types#signer)
- [StatClaimType](../wiki/api.entities.types#statclaimtype)
- [SubCallback](../wiki/api.entities.types#subcallback)
- [Subsidy](../wiki/api.entities.types#subsidy)
- [TickerReservation](../wiki/api.entities.types#tickerreservation)
- [UnscopedClaim](../wiki/api.entities.types#unscopedclaim)
- [UnsubCallback](../wiki/api.entities.types#unsubcallback)
- [Venue](../wiki/api.entities.types#venue)

## References

### AccountBalance

Re-exports [AccountBalance](../wiki/api.entities.Account.types#accountbalance)

___

### AccountIdentityRelation

Re-exports [AccountIdentityRelation](../wiki/api.entities.Account.types.AccountIdentityRelation)

___

### AccountKeyType

Re-exports [AccountKeyType](../wiki/api.entities.Account.types.AccountKeyType)

___

### AccountTypeInfo

Re-exports [AccountTypeInfo](../wiki/api.entities.Account.types.AccountTypeInfo)

___

### AffirmationStatus

Re-exports [AffirmationStatus](../wiki/api.entities.Instruction.types.AffirmationStatus)

___

### AgentWithGroup

Re-exports [AgentWithGroup](../wiki/api.entities.Asset.types.AgentWithGroup)

___

### AnyJson

Re-exports [AnyJson](../wiki/api.entities.MultiSigProposal.types#anyjson)

___

### Asset

Re-exports [Asset](../wiki/api.entities.Asset.types#asset)

___

### AssetDetails

Re-exports [AssetDetails](../wiki/api.entities.Asset.types.AssetDetails)

___

### AssetDocument

Re-exports [AssetDocument](../wiki/api.entities.Asset.types.AssetDocument)

___

### AssetWithGroup

Re-exports [AssetWithGroup](../wiki/api.entities.Asset.types.AssetWithGroup)

___

### Balance

Re-exports [Balance](../wiki/api.entities.Account.types.Balance)

___

### BaseHistoricAssetTransaction

Re-exports [BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction)

___

### CaCheckpointType

Re-exports [CaCheckpointType](../wiki/api.entities.Asset.Fungible.Checkpoints.types.CaCheckpointType)

___

### CheckpointScheduleParams

Re-exports [CheckpointScheduleParams](../wiki/api.entities.CheckpointSchedule.types#checkpointscheduleparams)

___

### CollectionKey

Re-exports [CollectionKey](../wiki/api.entities.Asset.types#collectionkey)

___

### CorporateActionDefaultConfig

Re-exports [CorporateActionDefaultConfig](../wiki/api.entities.Asset.Fungible.CorporateActions.types.CorporateActionDefaultConfig)

___

### CorporateActionKind

Re-exports [CorporateActionKind](../wiki/api.entities.CorporateActionBase.types.CorporateActionKind)

___

### CorporateActionParams

Renames and re-exports [Params](../wiki/api.entities.CorporateActionBase.Params)

___

### CorporateActionTargets

Re-exports [CorporateActionTargets](../wiki/api.entities.CorporateActionBase.types.CorporateActionTargets)

___

### DistributionParticipant

Re-exports [DistributionParticipant](../wiki/api.entities.DividendDistribution.types.DistributionParticipant)

___

### DividendDistributionDetails

Re-exports [DividendDistributionDetails](../wiki/api.entities.DividendDistribution.types.DividendDistributionDetails)

___

### DividendDistributionParams

Re-exports [DividendDistributionParams](../wiki/api.entities.DividendDistribution.DividendDistributionParams)

___

### FungibleLeg

Re-exports [FungibleLeg](../wiki/api.entities.Instruction.types.FungibleLeg)

___

### GlobalMetadataKey

Re-exports [GlobalMetadataKey](../wiki/api.entities.MetadataEntry.types#globalmetadatakey)

___

### GroupedInstructions

Re-exports [GroupedInstructions](../wiki/api.entities.Instruction.types.GroupedInstructions)

___

### GroupedInvolvedInstructions

Re-exports [GroupedInvolvedInstructions](../wiki/api.entities.Instruction.types.GroupedInvolvedInstructions)

___

### HeldNfts

Re-exports [HeldNfts](../wiki/api.entities.Asset.types.HeldNfts)

___

### HistoricAgentOperation

Re-exports [HistoricAgentOperation](../wiki/api.entities.Asset.types.HistoricAgentOperation)

___

### HistoricAssetTransaction

Re-exports [HistoricAssetTransaction](../wiki/api.entities.Asset.types.HistoricAssetTransaction)

___

### HistoricInstruction

Re-exports [HistoricInstruction](../wiki/api.entities.Venue.types#historicinstruction)

___

### HistoricNftTransaction

Re-exports [HistoricNftTransaction](../wiki/api.entities.Asset.types.HistoricNftTransaction)

___

### HistoricPolyxTransaction

Re-exports [HistoricPolyxTransaction](../wiki/api.entities.Account.types.HistoricPolyxTransaction)

___

### HistoricSettlement

Re-exports [HistoricSettlement](../wiki/api.entities.Portfolio.types.HistoricSettlement)

___

### IdentityBalance

Re-exports [IdentityBalance](../wiki/api.entities.Asset.types.IdentityBalance)

___

### IdentityHeldNfts

Re-exports [IdentityHeldNfts](../wiki/api.entities.Asset.types.IdentityHeldNfts)

___

### InputCaCheckpoint

Re-exports [InputCaCheckpoint](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint)

___

### InputTargets

Re-exports [InputTargets](../wiki/api.entities.CorporateActionBase.types#inputtargets)

___

### InputTaxWithholding

Re-exports [InputTaxWithholding](../wiki/api.entities.CorporateActionBase.types#inputtaxwithholding)

___

### InstructionAffirmation

Re-exports [InstructionAffirmation](../wiki/api.entities.Instruction.types.InstructionAffirmation)

___

### InstructionDetails

Re-exports [InstructionDetails](../wiki/api.entities.Instruction.types#instructiondetails)

___

### InstructionEndCondition

Re-exports [InstructionEndCondition](../wiki/api.entities.Instruction.types#instructionendcondition)

___

### InstructionStatus

Re-exports [InstructionStatus](../wiki/api.entities.Instruction.types.InstructionStatus)

___

### InstructionStatusResult

Re-exports [InstructionStatusResult](../wiki/api.entities.Instruction.types#instructionstatusresult)

___

### InstructionType

Re-exports [InstructionType](../wiki/api.entities.Instruction.types.InstructionType)

___

### InstructionsByStatus

Re-exports [InstructionsByStatus](../wiki/api.entities.Instruction.types#instructionsbystatus)

___

### Investment

Re-exports [Investment](../wiki/api.entities.Offering.types.Investment)

___

### KnownAssetType

Re-exports [KnownAssetType](../wiki/api.entities.Asset.types.KnownAssetType)

___

### KnownNftType

Re-exports [KnownNftType](../wiki/api.entities.Asset.types.KnownNftType)

___

### Leg

Re-exports [Leg](../wiki/api.entities.Instruction.types#leg)

___

### MediatorAffirmation

Re-exports [MediatorAffirmation](../wiki/api.entities.Instruction.types#mediatoraffirmation)

___

### MetadataDetails

Re-exports [MetadataDetails](../wiki/api.entities.MetadataEntry.types.MetadataDetails)

___

### MetadataKeyId

Re-exports [MetadataKeyId](../wiki/api.entities.Asset.types#metadatakeyid)

___

### MetadataLockStatus

Re-exports [MetadataLockStatus](../wiki/api.entities.MetadataEntry.types.MetadataLockStatus)

___

### MetadataSpec

Re-exports [MetadataSpec](../wiki/api.entities.MetadataEntry.types.MetadataSpec)

___

### MetadataType

Re-exports [MetadataType](../wiki/api.entities.MetadataEntry.types.MetadataType)

___

### MetadataValue

Re-exports [MetadataValue](../wiki/api.entities.MetadataEntry.types#metadatavalue)

___

### MetadataValueDetails

Re-exports [MetadataValueDetails](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails)

___

### MetadataWithValue

Re-exports [MetadataWithValue](../wiki/api.entities.MetadataEntry.types#metadatawithvalue)

___

### MultiSigDetails

Re-exports [MultiSigDetails](../wiki/api.entities.Account.MultiSig.types.MultiSigDetails)

___

### MultiSigProposalAction

Re-exports [MultiSigProposalAction](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalAction)

___

### MultiSigProposalDetails

Re-exports [MultiSigProposalDetails](../wiki/api.entities.MultiSigProposal.types.MultiSigProposalDetails)

___

### MultiSigProposalVote

Re-exports [MultiSigProposalVote](../wiki/api.entities.MultiSigProposal.types#multisigproposalvote)

___

### MultiSigSigners

Re-exports [MultiSigSigners](../wiki/api.entities.Account.MultiSig.types.MultiSigSigners)

___

### NftLeg

Re-exports [NftLeg](../wiki/api.entities.Instruction.types.NftLeg)

___

### NftMetadata

Re-exports [NftMetadata](../wiki/api.entities.Asset.types.NftMetadata)

___

### OffChainAffirmation

Re-exports [OffChainAffirmation](../wiki/api.entities.Instruction.types.OffChainAffirmation)

___

### OffChainLeg

Re-exports [OffChainLeg](../wiki/api.entities.Instruction.types.OffChainLeg)

___

### OfferingBalanceStatus

Re-exports [OfferingBalanceStatus](../wiki/api.entities.Offering.types.OfferingBalanceStatus)

___

### OfferingDetails

Re-exports [OfferingDetails](../wiki/api.entities.Offering.types.OfferingDetails)

___

### OfferingSaleStatus

Re-exports [OfferingSaleStatus](../wiki/api.entities.Offering.types.OfferingSaleStatus)

___

### OfferingStatus

Re-exports [OfferingStatus](../wiki/api.entities.Offering.types.OfferingStatus)

___

### OfferingTier

Re-exports [OfferingTier](../wiki/api.entities.Offering.types.OfferingTier)

___

### OfferingTimingStatus

Re-exports [OfferingTimingStatus](../wiki/api.entities.Offering.types.OfferingTimingStatus)

___

### PortfolioBalance

Re-exports [PortfolioBalance](../wiki/api.entities.Portfolio.types.PortfolioBalance)

___

### PortfolioCollection

Re-exports [PortfolioCollection](../wiki/api.entities.Portfolio.types.PortfolioCollection)

___

### ProposalStatus

Re-exports [ProposalStatus](../wiki/api.entities.MultiSigProposal.types.ProposalStatus)

___

### ScheduleDetails

Re-exports [ScheduleDetails](../wiki/api.entities.CheckpointSchedule.types.ScheduleDetails)

___

### SecurityIdentifier

Re-exports [SecurityIdentifier](../wiki/api.entities.Asset.types.SecurityIdentifier)

___

### SecurityIdentifierType

Re-exports [SecurityIdentifierType](../wiki/api.entities.Asset.types.SecurityIdentifierType)

___

### SettlementLeg

Re-exports [SettlementLeg](../wiki/api.entities.Portfolio.types#settlementleg)

___

### SubsidyData

Re-exports [SubsidyData](../wiki/api.entities.Subsidy.types.SubsidyData)

___

### SubsidyWithAllowance

Re-exports [SubsidyWithAllowance](../wiki/api.entities.Subsidy.types.SubsidyWithAllowance)

___

### TargetTreatment

Re-exports [TargetTreatment](../wiki/api.entities.CorporateActionBase.types.TargetTreatment)

___

### TaxWithholding

Re-exports [TaxWithholding](../wiki/api.entities.CorporateActionBase.types.TaxWithholding)

___

### TickerReservationDetails

Re-exports [TickerReservationDetails](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)

___

### TickerReservationStatus

Re-exports [TickerReservationStatus](../wiki/api.entities.TickerReservation.types.TickerReservationStatus)

___

### Tier

Re-exports [Tier](../wiki/api.entities.Offering.types.Tier)

___

### TransferBreakdown

Re-exports [TransferBreakdown](../wiki/api.entities.Asset.types.TransferBreakdown)

___

### TransferError

Re-exports [TransferError](../wiki/api.entities.Asset.types.TransferError)

___

### TransferRestrictionResult

Re-exports [TransferRestrictionResult](../wiki/api.entities.Asset.types.TransferRestrictionResult)

___

### TransferStatus

Re-exports [TransferStatus](../wiki/api.entities.Asset.types.TransferStatus)

___

### UniqueIdentifiers

Re-exports [UniqueIdentifiers](../wiki/api.entities.Asset.types.UniqueIdentifiers)

___

### VenueDetails

Re-exports [VenueDetails](../wiki/api.entities.Venue.types.VenueDetails)

___

### VenueFilteringDetails

Re-exports [VenueFilteringDetails](../wiki/api.entities.Asset.types.VenueFilteringDetails)

___

### VenueType

Re-exports [VenueType](../wiki/api.entities.Venue.types.VenueType)

## Type Aliases

### Account

Ƭ **Account**: [`Account`](../wiki/api.entities.Account.Account)

#### Defined in

[api/entities/types.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L43)

___

### ActiveStats

Ƭ **ActiveStats**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `claims?` | \{ `claimType`: [`ClaimType`](../wiki/api.entities.types.ClaimType) ; `issuer`: [`Identity`](../wiki/api.entities.types#identity)  }[] |
| `isSet` | `boolean` |

#### Defined in

[api/entities/types.ts:832](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L832)

___

### AddRelayerPayingKeyAuthorizationData

Ƭ **AddRelayerPayingKeyAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`AddRelayerPayingKey`](../wiki/api.entities.types.AuthorizationType#addrelayerpayingkey) |
| `value` | [`SubsidyData`](../wiki/api.entities.Subsidy.types.SubsidyData) |

#### Defined in

[api/entities/types.ts:460](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L460)

___

### AttestPrimaryKeyRotationAuthorizationData

Ƭ **AttestPrimaryKeyRotationAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`AttestPrimaryKeyRotation`](../wiki/api.entities.types.AuthorizationType#attestprimarykeyrotation) |
| `value` | [`Identity`](../wiki/api.entities.types#identity) |

#### Defined in

[api/entities/types.ts:431](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L431)

___

### Authorization

Ƭ **Authorization**: [`AttestPrimaryKeyRotationAuthorizationData`](../wiki/api.entities.types#attestprimarykeyrotationauthorizationdata) \| [`RotatePrimaryKeyAuthorizationData`](../wiki/api.entities.types#rotateprimarykeyauthorizationdata) \| [`JoinIdentityAuthorizationData`](../wiki/api.entities.types#joinidentityauthorizationdata) \| [`PortfolioCustodyAuthorizationData`](../wiki/api.entities.types#portfoliocustodyauthorizationdata) \| [`BecomeAgentAuthorizationData`](../wiki/api.entities.types#becomeagentauthorizationdata) \| [`AddRelayerPayingKeyAuthorizationData`](../wiki/api.entities.types#addrelayerpayingkeyauthorizationdata) \| [`RotatePrimaryKeyToSecondaryData`](../wiki/api.entities.types#rotateprimarykeytosecondarydata) \| [`GenericAuthorizationData`](../wiki/api.entities.types#genericauthorizationdata)

Authorization request data corresponding to type

#### Defined in

[api/entities/types.ts:481](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L481)

___

### AuthorizationRequest

Ƭ **AuthorizationRequest**: [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)

#### Defined in

[api/entities/types.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L46)

___

### BecomeAgentAuthorizationData

Ƭ **BecomeAgentAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`BecomeAgent`](../wiki/api.entities.types.AuthorizationType#becomeagent) |
| `value` | [`KnownPermissionGroup`](../wiki/api.entities.types#knownpermissiongroup) \| [`CustomPermissionGroup`](../wiki/api.entities.types#custompermissiongroup) |

#### Defined in

[api/entities/types.ts:455](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L455)

___

### Checkpoint

Ƭ **Checkpoint**: [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)

#### Defined in

[api/entities/types.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L47)

___

### CheckpointSchedule

Ƭ **CheckpointSchedule**: [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule)

#### Defined in

[api/entities/types.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L48)

___

### ChildIdentity

Ƭ **ChildIdentity**: [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)

#### Defined in

[api/entities/types.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L55)

___

### Claim

Ƭ **Claim**: [`ScopedClaim`](../wiki/api.entities.types#scopedclaim) \| [`UnscopedClaim`](../wiki/api.entities.types#unscopedclaim)

#### Defined in

[api/entities/types.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L239)

___

### ClaimCountStatInput

Ƭ **ClaimCountStatInput**: \{ `claimType`: [`Accredited`](../wiki/api.entities.types.ClaimType#accredited) ; `issuer`: [`Identity`](../wiki/api.entities.types#identity) ; `value`: \{ `accredited`: `BigNumber` ; `nonAccredited`: `BigNumber`  }  } \| \{ `claimType`: [`Affiliate`](../wiki/api.entities.types.ClaimType#affiliate) ; `issuer`: [`Identity`](../wiki/api.entities.types#identity) ; `value`: \{ `affiliate`: `BigNumber` ; `nonAffiliate`: `BigNumber`  }  } \| \{ `claimType`: [`Jurisdiction`](../wiki/api.entities.types.ClaimType#jurisdiction) ; `issuer`: [`Identity`](../wiki/api.entities.types#identity) ; `value`: \{ `count`: `BigNumber` ; `countryCode`: [`CountryCode`](../wiki/generated.types.CountryCode)  }[]  }

#### Defined in

[api/entities/types.ts:564](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L564)

___

### Condition

Ƭ **Condition**: [`SingleClaimCondition`](../wiki/api.entities.types.SingleClaimCondition) \| [`MultiClaimCondition`](../wiki/api.entities.types.MultiClaimCondition) \| [`IdentityCondition`](../wiki/api.entities.types.IdentityCondition) \| [`ExternalAgentCondition`](../wiki/api.entities.types.ExternalAgentCondition) & [`ConditionBase`](../wiki/api.entities.types.ConditionBase)

#### Defined in

[api/entities/types.ts:373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L373)

___

### CorporateAction

Ƭ **CorporateAction**: [`CorporateAction`](../wiki/api.entities.CorporateAction.CorporateAction)

#### Defined in

[api/entities/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L49)

___

### CustomClaimWithoutScope

Ƭ **CustomClaimWithoutScope**: `Omit`\<[`CustomClaim`](../wiki/api.entities.types.CustomClaim), ``"scope"``\> & \{ `scope`: `undefined`  }

#### Defined in

[api/entities/types.ts:219](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L219)

___

### CustomPermissionGroup

Ƭ **CustomPermissionGroup**: [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup.CustomPermissionGroup)

#### Defined in

[api/entities/types.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L50)

___

### DefaultPortfolio

Ƭ **DefaultPortfolio**: [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

#### Defined in

[api/entities/types.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L51)

___

### DefaultTrustedClaimIssuer

Ƭ **DefaultTrustedClaimIssuer**: [`DefaultTrustedClaimIssuer`](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer)

#### Defined in

[api/entities/types.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L52)

___

### DividendDistribution

Ƭ **DividendDistribution**: [`DividendDistribution`](../wiki/api.entities.DividendDistribution.DividendDistribution)

#### Defined in

[api/entities/types.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L53)

___

### FungibleAsset

Ƭ **FungibleAsset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

#### Defined in

[api/entities/types.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L59)

___

### GenericAuthorizationData

Ƭ **GenericAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | `Exclude`\<[`AuthorizationType`](../wiki/api.entities.types.AuthorizationType), [`RotatePrimaryKey`](../wiki/api.entities.types.AuthorizationType#rotateprimarykey) \| [`JoinIdentity`](../wiki/api.entities.types.AuthorizationType#joinidentity) \| [`PortfolioCustody`](../wiki/api.entities.types.AuthorizationType#portfoliocustody) \| [`BecomeAgent`](../wiki/api.entities.types.AuthorizationType#becomeagent) \| [`AddRelayerPayingKey`](../wiki/api.entities.types.AuthorizationType#addrelayerpayingkey) \| [`RotatePrimaryKeyToSecondary`](../wiki/api.entities.types.AuthorizationType#rotateprimarykeytosecondary) \| [`AttestPrimaryKeyRotation`](../wiki/api.entities.types.AuthorizationType#attestprimarykeyrotation)\> |
| `value` | `string` |

#### Defined in

[api/entities/types.ts:465](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L465)

___

### GroupPermissions

Ƭ **GroupPermissions**: `Pick`\<[`Permissions`](../wiki/api.entities.types.Permissions), ``"transactions"`` \| ``"transactionGroups"``\>

Asset permissions shared by agents in a group

#### Defined in

[api/entities/types.ts:666](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L666)

___

### Identity

Ƭ **Identity**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/entities/types.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L54)

___

### InputCondition

Ƭ **InputCondition**: [`SingleClaimCondition`](../wiki/api.entities.types.SingleClaimCondition) \| [`MultiClaimCondition`](../wiki/api.entities.types.MultiClaimCondition) \| [`Modify`](../wiki/types.utils#modify)\<[`IdentityCondition`](../wiki/api.entities.types.IdentityCondition), \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.types#identity)  }\> \| [`ExternalAgentCondition`](../wiki/api.entities.types.ExternalAgentCondition) & [`InputConditionBase`](../wiki/api.entities.types#inputconditionbase)

#### Defined in

[api/entities/types.ts:381](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L381)

___

### InputConditionBase

Ƭ **InputConditionBase**: [`Modify`](../wiki/types.utils#modify)\<[`ConditionBase`](../wiki/api.entities.types.ConditionBase), \{ `trustedClaimIssuers?`: [`InputTrustedClaimIssuer`](../wiki/api.entities.types#inputtrustedclaimissuer)[]  }\>

#### Defined in

[api/entities/types.ts:344](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L344)

___

### InputRequirement

Ƭ **InputRequirement**: [`Modify`](../wiki/types.utils#modify)\<[`Requirement`](../wiki/api.entities.types.Requirement), \{ `conditions`: [`InputCondition`](../wiki/api.entities.types#inputcondition)[]  }\>

#### Defined in

[api/entities/types.ts:407](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L407)

___

### InputStatClaim

Ƭ **InputStatClaim**: [`StatJurisdictionClaimInput`](../wiki/api.entities.types.StatJurisdictionClaimInput) \| [`StatAccreditedClaimInput`](../wiki/api.entities.types.StatAccreditedClaimInput) \| [`StatAffiliateClaimInput`](../wiki/api.entities.types.StatAffiliateClaimInput)

#### Defined in

[api/entities/types.ts:267](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L267)

___

### InputStatType

Ƭ **InputStatType**: \{ `type`: [`Count`](../wiki/api.entities.types.StatType#count) \| [`Balance`](../wiki/api.entities.types.StatType#balance)  } \| \{ `claimIssuer`: [`StatClaimIssuer`](../wiki/api.entities.types.StatClaimIssuer) ; `type`: [`ScopedCount`](../wiki/api.entities.types.StatType#scopedcount) \| [`ScopedBalance`](../wiki/api.entities.types.StatType#scopedbalance)  }

#### Defined in

[api/entities/types.ts:272](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L272)

___

### InputTrustedClaimIssuer

Ƭ **InputTrustedClaimIssuer**: [`Modify`](../wiki/types.utils#modify)\<[`TrustedClaimIssuer`](../wiki/api.entities.types.TrustedClaimIssuer), \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.types#identity)  }\>

#### Defined in

[api/entities/types.ts:320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L320)

___

### Instruction

Ƭ **Instruction**: [`Instruction`](../wiki/api.entities.Instruction.Instruction)

#### Defined in

[api/entities/types.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L56)

___

### JoinIdentityAuthorizationData

Ƭ **JoinIdentityAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`JoinIdentity`](../wiki/api.entities.types.AuthorizationType#joinidentity) |
| `value` | [`Permissions`](../wiki/api.entities.types.Permissions) |

#### Defined in

[api/entities/types.ts:445](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L445)

___

### KnownPermissionGroup

Ƭ **KnownPermissionGroup**: [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup.KnownPermissionGroup)

#### Defined in

[api/entities/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L57)

___

### MetadataEntry

Ƭ **MetadataEntry**: [`MetadataEntry`](../wiki/api.entities.MetadataEntry.MetadataEntry)

#### Defined in

[api/entities/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L62)

___

### MultiSig

Ƭ **MultiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

#### Defined in

[api/entities/types.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L44)

___

### MultiSigProposal

Ƭ **MultiSigProposal**: [`MultiSigProposal`](../wiki/api.entities.MultiSigProposal.MultiSigProposal)

#### Defined in

[api/entities/types.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L45)

___

### NextKey

Ƭ **NextKey**: `string` \| `BigNumber` \| ``null``

#### Defined in

[api/entities/types.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L92)

___

### Nft

Ƭ **Nft**: [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft)

#### Defined in

[api/entities/types.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L60)

___

### NftCollection

Ƭ **NftCollection**: [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)

#### Defined in

[api/entities/types.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L61)

___

### NonFungiblePortfolioMovement

Ƭ **NonFungiblePortfolioMovement**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `asset` | [`NftCollection`](../wiki/api.entities.types#nftcollection) \| `string` | - |
| `memo?` | `string` | identifier string to help differentiate transfers |
| `nfts` | ([`Nft`](../wiki/api.entities.types#nft) \| `BigNumber`)[] | - |

#### Defined in

[api/entities/types.ts:821](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L821)

___

### NumberedPortfolio

Ƭ **NumberedPortfolio**: [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio)

#### Defined in

[api/entities/types.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L58)

___

### Offering

Ƭ **Offering**: [`Offering`](../wiki/api.entities.Offering.Offering)

#### Defined in

[api/entities/types.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L63)

___

### PermissionsLike

Ƭ **PermissionsLike**: \{ `assets?`: [`SectionPermissions`](../wiki/api.entities.types.SectionPermissions)\<`string` \| [`FungibleAsset`](../wiki/api.entities.types#fungibleasset)\> \| ``null`` ; `portfolios?`: [`SectionPermissions`](../wiki/api.entities.types.SectionPermissions)\<[`PortfolioLike`](../wiki/api.entities.types#portfoliolike)\> \| ``null``  } & \{ `transactions?`: [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions) \| ``null``  } \| \{ `transactionGroups?`: [`TxGroup`](../wiki/api.procedures.types.TxGroup)[]  }

Permissions to grant to a Signer over an Identity

[Permissions](../wiki/api.entities.types.Permissions)

**`Note`**

TxGroups in the `transactionGroups` array will be transformed into their corresponding `TxTag`s

#### Defined in

[api/entities/types.ts:791](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L791)

___

### PortfolioCustodyAuthorizationData

Ƭ **PortfolioCustodyAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`PortfolioCustody`](../wiki/api.entities.types.AuthorizationType#portfoliocustody) |
| `value` | [`NumberedPortfolio`](../wiki/api.entities.types#numberedportfolio) \| [`DefaultPortfolio`](../wiki/api.entities.types#defaultportfolio) |

#### Defined in

[api/entities/types.ts:450](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L450)

___

### PortfolioLike

Ƭ **PortfolioLike**: `string` \| [`Identity`](../wiki/api.entities.types#identity) \| [`NumberedPortfolio`](../wiki/api.entities.types#numberedportfolio) \| [`DefaultPortfolio`](../wiki/api.entities.types#defaultportfolio) \| \{ `id`: `BigNumber` ; `identity`: `string` \| [`Identity`](../wiki/api.entities.types#identity)  }

#### Defined in

[api/entities/types.ts:777](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L777)

___

### PortfolioMovement

Ƭ **PortfolioMovement**: [`FungiblePortfolioMovement`](../wiki/api.entities.types.FungiblePortfolioMovement) \| [`NonFungiblePortfolioMovement`](../wiki/api.entities.types#nonfungibleportfoliomovement)

#### Defined in

[api/entities/types.ts:830](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L830)

___

### RotatePrimaryKeyAuthorizationData

Ƭ **RotatePrimaryKeyAuthorizationData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`RotatePrimaryKey`](../wiki/api.entities.types.AuthorizationType#rotateprimarykey) |

#### Defined in

[api/entities/types.ts:436](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L436)

___

### RotatePrimaryKeyToSecondaryData

Ƭ **RotatePrimaryKeyToSecondaryData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | [`RotatePrimaryKeyToSecondary`](../wiki/api.entities.types.AuthorizationType#rotateprimarykeytosecondary) |
| `value` | [`Permissions`](../wiki/api.entities.types.Permissions) |

#### Defined in

[api/entities/types.ts:440](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L440)

___

### ScopedClaim

Ƭ **ScopedClaim**: [`JurisdictionClaim`](../wiki/api.entities.types.JurisdictionClaim) \| [`AccreditedClaim`](../wiki/api.entities.types.AccreditedClaim) \| [`AffiliateClaim`](../wiki/api.entities.types.AffiliateClaim) \| [`BuyLockupClaim`](../wiki/api.entities.types.BuyLockupClaim) \| [`SellLockupClaim`](../wiki/api.entities.types.SellLockupClaim) \| [`KycClaim`](../wiki/api.entities.types.KycClaim) \| [`ExemptedClaim`](../wiki/api.entities.types.ExemptedClaim) \| [`BlockedClaim`](../wiki/api.entities.types.BlockedClaim) \| [`CustomClaim`](../wiki/api.entities.types.CustomClaim)

#### Defined in

[api/entities/types.ts:226](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L226)

___

### Signer

Ƭ **Signer**: [`Identity`](../wiki/api.entities.types#identity) \| [`Account`](../wiki/api.entities.types#account)

#### Defined in

[api/entities/types.ts:759](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L759)

___

### StatClaimType

Ƭ **StatClaimType**: [`Accredited`](../wiki/api.entities.types.ClaimType#accredited) \| [`Affiliate`](../wiki/api.entities.types.ClaimType#affiliate) \| [`Jurisdiction`](../wiki/api.entities.types.ClaimType#jurisdiction)

#### Defined in

[api/entities/types.ts:250](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L250)

___

### SubCallback

Ƭ **SubCallback**\<`T`\>: (`result`: `T`) => `void` \| `Promise`\<`void`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`result`): `void` \| `Promise`\<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `T` |

##### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

[api/entities/types.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L83)

___

### Subsidy

Ƭ **Subsidy**: [`Subsidy`](../wiki/api.entities.Subsidy.Subsidy)

#### Defined in

[api/entities/types.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L66)

___

### TickerReservation

Ƭ **TickerReservation**: [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)

#### Defined in

[api/entities/types.ts:64](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L64)

___

### UnscopedClaim

Ƭ **UnscopedClaim**: [`CddClaim`](../wiki/api.entities.types.CddClaim) \| [`CustomClaimWithoutScope`](../wiki/api.entities.types#customclaimwithoutscope)

#### Defined in

[api/entities/types.ts:237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L237)

___

### UnsubCallback

Ƭ **UnsubCallback**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[api/entities/types.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L85)

___

### Venue

Ƭ **Venue**: [`Venue`](../wiki/api.entities.Venue.Venue)

#### Defined in

[api/entities/types.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L65)
