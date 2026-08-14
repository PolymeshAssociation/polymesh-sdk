[@polymeshassociation/polymesh-sdk](../wiki/README) / types/txGroupConstants

# types/txGroupConstants

## Variables

### ADVANCED\_ASSET\_MANAGEMENT\_TX\_TAGS

> `const` **ADVANCED\_ASSET\_MANAGEMENT\_TX\_TAGS**: \[`AcceptAssetOwnershipTransfer`, `ControllerTransfer`, `Freeze`, `Unfreeze`, `ControllerTransfer`\]

Defined in: [types/txGroupConstants.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L27)

Transaction tags for Advanced Asset Management operations
Contains asset freeze/unfreeze, controller transfer, and NFT management operations.

Values:
- TxTags.asset.AcceptAssetOwnershipTransfer
- TxTags.asset.ControllerTransfer
- TxTags.asset.Freeze
- TxTags.asset.Unfreeze
- TxTags.nft.ControllerTransfer

#### Note

AcceptAssetOwnershipTransfer has unique permission checking - it verifies that the identity
that created the authorization was an agent with AcceptAssetOwnershipTransfer permission so an agent with this
permission can transfer the ownership of the asset.

***

### AGENT\_TX\_GROUP\_VALUES

> `const` **AGENT\_TX\_GROUP\_VALUES**: readonly \[[`AdvancedAssetManagement`](../wiki/api.procedures.types#advancedassetmanagement), [`AssetDocumentManagement`](../wiki/api.procedures.types#assetdocumentmanagement), [`AssetManagement`](../wiki/api.procedures.types#assetmanagement), [`AssetMetadataManagement`](../wiki/api.procedures.types#assetmetadatamanagement), [`CapitalDistribution`](../wiki/api.procedures.types#capitaldistribution), [`CheckpointManagement`](../wiki/api.procedures.types#checkpointmanagement), [`ComplianceManagement`](../wiki/api.procedures.types#compliancemanagement), [`CorporateActionsManagement`](../wiki/api.procedures.types#corporateactionsmanagement), [`CorporateBallotManagement`](../wiki/api.procedures.types#corporateballotmanagement), [`ExternalAgentManagement`](../wiki/api.procedures.types#externalagentmanagement), [`Issuance`](../wiki/api.procedures.types#issuance), [`Redemption`](../wiki/api.procedures.types#redemption), [`StoManagement`](../wiki/api.procedures.types#stomanagement), [`TrustedClaimIssuersManagement`](../wiki/api.procedures.types#trustedclaimissuersmanagement)\]

Defined in: [types/txGroupConstants.ts:591](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L591)

Runtime list of `TxGroup` values that are permitted for External Agent permissions.

- Pairs with [api/procedures/types!AgentTxGroup](../wiki/api.procedures.types#agenttxgroup) for compile-time safety.
- Use this constant when you need to iterate, validate, or render the allowed groups at runtime
  without duplicating definitions.
- All transactions in these groups are available to both Agents and Secondary Keys.
- Groups are ordered alphabetically for consistency.

#### Example

**Iterate allowed agent groups and retrieve their transactions**

```ts
AGENT_TX_GROUP_VALUES.forEach(group => {
  const tags = txGroupToTxTags(group);
  // render group with its tags, build UI options, etc.
});
```

***

### ASSET\_DOCUMENT\_MANAGEMENT\_TX\_TAGS

> `const` **ASSET\_DOCUMENT\_MANAGEMENT\_TX\_TAGS**: \[`AddDocuments`, `RemoveDocuments`\]

Defined in: [types/txGroupConstants.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L66)

Transaction tags for Asset Document Management operations
Contains operations for managing asset documents.

Values:
- TxTags.asset.AddDocuments
- TxTags.asset.RemoveDocuments

***

### ASSET\_MANAGEMENT\_TX\_TAGS

> `const` **ASSET\_MANAGEMENT\_TX\_TAGS**: \[`LinkTickerToAssetId`, `MakeDivisible`, `RenameAsset`, `SetFundingRound`, `UnlinkTickerFromAssetId`, `UpdateAssetType`, `UpdateIdentifiers`\]

Defined in: [types/txGroupConstants.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L48)

Transaction tags for Asset Management operations
Contains basic asset management operations like divisibility, linking, and metadata.

Values:
- TxTags.asset.LinkTickerToAssetId
- TxTags.asset.MakeDivisible
- TxTags.asset.RenameAsset
- TxTags.asset.SetFundingRound
- TxTags.asset.UnlinkTickerFromAssetId
- TxTags.asset.UpdateAssetType
- TxTags.asset.UpdateIdentifiers

***

### ASSET\_METADATA\_MANAGEMENT\_TX\_TAGS

> `const` **ASSET\_METADATA\_MANAGEMENT\_TX\_TAGS**: \[`RegisterAndSetLocalAssetMetadata`, `RegisterAssetMetadataLocalType`, `RemoveLocalMetadataKey`, `RemoveMetadataValue`, `SetAssetMetadata`, `SetAssetMetadataDetails`\]

Defined in: [types/txGroupConstants.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L83)

Transaction tags for Asset Metadata Management operations
Contains operations for managing asset metadata.

Values:
- TxTags.asset.RegisterAndSetLocalAssetMetadata
- TxTags.asset.RegisterAssetMetadataLocalType
- TxTags.asset.RemoveLocalMetadataKey
- TxTags.asset.RemoveMetadataValue
- TxTags.asset.SetAssetMetadata
- TxTags.asset.SetAssetMetadataDetails

***

### ASSET\_REGISTRATION\_TX\_TAGS

> `const` **ASSET\_REGISTRATION\_TX\_TAGS**: \[`AcceptAssetOwnershipTransfer`, `AcceptTickerTransfer`, `CreateAsset`, `CreateAssetWithCustomType`, `RegisterCustomAssetType`, `RegisterUniqueTicker`, `CreateNftCollection`\]

Defined in: [types/txGroupConstants.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L109)

Transaction tags for Asset Registration operations
Contains operations for registering assets, custom types, and NFT collections.

Values:
- TxTags.asset.AcceptAssetOwnershipTransfer
- TxTags.asset.AcceptTickerTransfer
- TxTags.asset.CreateAsset
- TxTags.asset.CreateAssetWithCustomType
- TxTags.asset.RegisterCustomAssetType
- TxTags.asset.RegisterUniqueTicker
- TxTags.nft.CreateNftCollection

#### Note

`TxTags.nft.CreateNftCollection` is Agent checked when the collection is created under an
  existing Asset. This group is not agent grantable, so that path is covered by
  `ISSUANCE_TX_TAGS` instead

***

### AUTHORIZATION\_MANAGEMENT\_TX\_TAGS

> `const` **AUTHORIZATION\_MANAGEMENT\_TX\_TAGS**: \[`AddAuthorization`, `RemoveAuthorization`\]

Defined in: [types/txGroupConstants.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L127)

Transaction tags for Authorization Management operations
Contains operations for managing identity authorizations.

Values:
- TxTags.identity.AddAuthorization
- TxTags.identity.RemoveAuthorization

***

### CAPITAL\_DISTRIBUTION\_TX\_TAGS

> `const` **CAPITAL\_DISTRIBUTION\_TX\_TAGS**: \[`Distribute`, `PushBenefit`, `Reclaim`, `RemoveDistribution`\]

Defined in: [types/txGroupConstants.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L142)

Transaction tags for Capital Distribution operations
Contains operations for managing capital distributions.

Values:
- TxTags.capitalDistribution.Distribute
- TxTags.capitalDistribution.PushBenefit
- TxTags.capitalDistribution.Reclaim
- TxTags.capitalDistribution.RemoveDistribution

***

### ~~CDD\_REGISTRATION\_TX\_TAGS~~

> `const` **CDD\_REGISTRATION\_TX\_TAGS**: \[`CddRegisterDid`, `CddRegisterDidWithCdd`\]

Defined in: [types/txGroupConstants.ts:160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L160)

Transaction tags for CDD Registration operations
Contains the deprecated DID registration extrinsics.

Values:
- TxTags.identity.CddRegisterDid
- TxTags.identity.CddRegisterDidWithCdd

#### Deprecated

these extrinsics no longer attach a `CustomerDueDiligence` claim as of chain v8.
  Use [DID\_REGISTRATION\_TX\_TAGS](../wiki/#did_registration_tx_tags) instead

***

### CHECKPOINT\_MANAGEMENT\_TX\_TAGS

> `const` **CHECKPOINT\_MANAGEMENT\_TX\_TAGS**: \[`CreateCheckpoint`, `CreateSchedule`, `RemoveSchedule`\]

Defined in: [types/txGroupConstants.ts:185](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L185)

Transaction tags for Checkpoint Management operations
Contains operations for creating and managing asset checkpoints.

Values:
- TxTags.checkpoint.CreateCheckpoint
- TxTags.checkpoint.CreateSchedule
- TxTags.checkpoint.RemoveSchedule

***

### CLAIMS\_MANAGEMENT\_TX\_TAGS

> `const` **CLAIMS\_MANAGEMENT\_TX\_TAGS**: \[`AddClaim`, `RegisterCustomClaimType`, `RevokeClaim`, `RevokeClaimByIndex`\]

Defined in: [types/txGroupConstants.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L201)

Transaction tags for Claims Management operations
Contains operations for adding, revoking, and managing identity claims.

Values:
- TxTags.identity.AddClaim
- TxTags.identity.RegisterCustomClaimType
- TxTags.identity.RevokeClaim
- TxTags.identity.RevokeClaimByIndex

***

### COMPLIANCE\_MANAGEMENT\_TX\_TAGS

> `const` **COMPLIANCE\_MANAGEMENT\_TX\_TAGS**: \[`AddMandatoryMediators`, `RemoveMandatoryMediators`, `AddComplianceRequirement`, `ChangeComplianceRequirement`, `PauseAssetCompliance`, `RemoveComplianceRequirement`, `ReplaceAssetCompliance`\]

Defined in: [types/txGroupConstants.ts:230](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L230)

Transaction tags for Compliance Management operations
Contains comprehensive compliance management operations.

Values:
- TxTags.asset.AddMandatoryMediators
- TxTags.asset.RemoveMandatoryMediators
- TxTags.complianceManager.AddComplianceRequirement
- TxTags.complianceManager.ChangeComplianceRequirement
- TxTags.complianceManager.PauseAssetCompliance
- TxTags.complianceManager.RemoveComplianceRequirement
- TxTags.complianceManager.ReplaceAssetCompliance
- TxTags.complianceManager.ResetAssetCompliance
- TxTags.complianceManager.ResumeAssetCompliance
- TxTags.settlement.AllowVenues
- TxTags.settlement.DisallowVenues
- TxTags.settlement.SetVenueFiltering
- TxTags.statistics.BatchUpdateAssetStats
- TxTags.statistics.SetActiveAssetStats
- TxTags.statistics.SetAssetTransferCompliance
- TxTags.statistics.SetEntitiesExempt

***

### CORPORATE\_ACTIONS\_MANAGEMENT\_TX\_TAGS

> `const` **CORPORATE\_ACTIONS\_MANAGEMENT\_TX\_TAGS**: \[`ChangeRecordDate`, `InitiateCorporateAction`, `InitiateCorporateActionAndBallot`, `InitiateCorporateActionAndDistribute`, `LinkCaDoc`, `RemoveCa`, `SetDefaultTargets`, `SetDefaultWithholdingTax`, `SetDidWithholdingTax`\]

Defined in: [types/txGroupConstants.ts:264](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L264)

Transaction tags for Corporate Actions Management operations
Contains operations for managing corporate actions.

Values:
- TxTags.corporateAction.ChangeRecordDate
- TxTags.corporateAction.InitiateCorporateAction
- TxTags.corporateAction.InitiateCorporateActionAndBallot
- TxTags.corporateAction.InitiateCorporateActionAndDistribute
- TxTags.corporateAction.LinkCaDoc
- TxTags.corporateAction.RemoveCa
- TxTags.corporateAction.SetDefaultTargets
- TxTags.corporateAction.SetDefaultWithholdingTax
- TxTags.corporateAction.SetDidWithholdingTax

***

### CORPORATE\_BALLOT\_MANAGEMENT\_TX\_TAGS

> `const` **CORPORATE\_BALLOT\_MANAGEMENT\_TX\_TAGS**: \[`AttachBallot`, `ChangeEnd`, `ChangeMeta`, `ChangeRcv`, `RemoveBallot`\]

Defined in: [types/txGroupConstants.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L287)

Transaction tags for Corporate Ballot Management operations
Contains operations for managing corporate ballots.

Values:
- TxTags.corporateBallot.AttachBallot
- TxTags.corporateBallot.ChangeEnd
- TxTags.corporateBallot.ChangeMeta
- TxTags.corporateBallot.ChangeRcv
- TxTags.corporateBallot.RemoveBallot

***

### CORPORATE\_VOTING\_TX\_TAGS

> `const` **CORPORATE\_VOTING\_TX\_TAGS**: \[`Vote`\]

Defined in: [types/txGroupConstants.ts:302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L302)

Transaction tags for Corporate Voting operations
Contains operations for voting in corporate ballots.

Values:
- TxTags.corporateBallot.Vote

***

### DID\_REGISTRATION\_TX\_TAGS

> `const` **DID\_REGISTRATION\_TX\_TAGS**: \[`RegisterDid`\]

Defined in: [types/txGroupConstants.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L172)

Transaction tags for DID Registration operations
Contains registrar-gated DID registration, superseding CDD registration.

Values:
- TxTags.identity.RegisterDid

***

### EXTERNAL\_AGENT\_MANAGEMENT\_TX\_TAGS

> `const` **EXTERNAL\_AGENT\_MANAGEMENT\_TX\_TAGS**: \[`AcceptBecomeAgent`, `ChangeGroup`, `CreateAndChangeCustomGroup`, `CreateGroup`, `CreateGroupAndAddAuth`, `RemoveAgent`, `SetGroupPermissions`\]

Defined in: [types/txGroupConstants.ts:325](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L325)

Transaction tags for External Agent Management operations
Contains operations for managing external agents and their permissions.

Values:
- TxTags.externalAgents.AcceptBecomeAgent
- TxTags.externalAgents.ChangeGroup
- TxTags.externalAgents.CreateAndChangeCustomGroup
- TxTags.externalAgents.CreateGroup
- TxTags.externalAgents.CreateGroupAndAddAuth
- TxTags.externalAgents.RemoveAgent
- TxTags.externalAgents.SetGroupPermissions

#### Note

AcceptBecomeAgent has unique permission checking - when an invitation is accepted, the chain
verifies that the identity that created the authorization was an agent with AcceptBecomeAgent
permission, so an agent with this permission can invite other agents to the Asset. It is also a
member of `EXTERNAL_AGENT_PARTICIPATION_TX_TAGS`, which grants a Secondary Key the ability to
accept an invitation on its own Identity's behalf.

***

### EXTERNAL\_AGENT\_PARTICIPATION\_TX\_TAGS

> `const` **EXTERNAL\_AGENT\_PARTICIPATION\_TX\_TAGS**: \[`Abdicate`, `AcceptBecomeAgent`\]

Defined in: [types/txGroupConstants.ts:343](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L343)

Transaction tags for External Agent Participation operations
Contains operations for joining and leaving external agent roles.

Values:
- TxTags.externalAgents.Abdicate
- TxTags.externalAgents.AcceptBecomeAgent

***

### INSTRUCTION\_MEDIATION\_TX\_TAGS

> `const` **INSTRUCTION\_MEDIATION\_TX\_TAGS**: \[`AffirmInstructionAsMediator`, `LockInstruction`, `RejectInstructionAsMediator`, `UnlockInstruction`\]

Defined in: [types/txGroupConstants.ts:424](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L424)

Transaction tags for Instruction Mediation operations
Contains the operations available to an Instruction's mediators — affirming or rejecting as a
mediator, and locking/unlocking an Instruction for execution.

Values:
- TxTags.settlement.AffirmInstructionAsMediator
- TxTags.settlement.LockInstruction
- TxTags.settlement.RejectInstructionAsMediator
- TxTags.settlement.UnlockInstruction

***

### ISSUANCE\_TX\_TAGS

> `const` **ISSUANCE\_TX\_TAGS**: \[`Issue`, `CreateNftCollection`, `IssueNft`\]

Defined in: [types/txGroupConstants.ts:446](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L446)

Transaction tags for Issuance operations
Contains fungible asset and NFT issuance operations.

Values:
- TxTags.asset.Issue
- TxTags.nft.CreateNftCollection
- TxTags.nft.IssueNft

#### Note

`TxTags.nft.CreateNftCollection` is also a member of `ASSET_REGISTRATION_TX_TAGS`. The
  extrinsic takes two paths on chain: creating a collection for a **new** Asset is a Secondary
  Key operation (`ensure_origin_call_permissions`), while creating one under an **existing**
  Asset is Agent checked (`ExternalAgents::ensure_agent_asset_perms`). `TxGroup.AssetRegistration`
  is not agent grantable, so it covers only the first path - this group covers the second

***

### MULTISIG\_MANAGEMENT\_TX\_TAGS

> `const` **MULTISIG\_MANAGEMENT\_TX\_TAGS**: \[`CreateMultisig`\]

Defined in: [types/txGroupConstants.ts:463](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L463)

Transaction tags for MultiSig Management operations
Contains operations for managing multi-signature accounts.

Values:
- TxTags.multiSig.CreateMultisig

#### Note

a MultiSig executes proposals under its own origin, so what it may do via proposal is
  constrained by the permissions held by the MultiSig Account itself, not by those of its
  signers. Those permissions are drawn from these same groups

***

### PORTFOLIO\_MANAGEMENT\_TX\_TAGS

> `const` **PORTFOLIO\_MANAGEMENT\_TX\_TAGS**: \[`AcceptPortfolioCustody`, `AllowIdentityToCreatePortfolios`, `CreateCustodyPortfolio`, `CreatePortfolio`, `DeletePortfolio`, `MovePortfolioFunds`, `QuitPortfolioCustody`, `RenamePortfolio`, `RevokeCreatePortfoliosPermission`\]

Defined in: [types/txGroupConstants.ts:482](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L482)

Transaction tags for Portfolio Management operations
Contains comprehensive portfolio management including creation, custody, movement, and operations.

Values:
- TxTags.portfolio.AcceptPortfolioCustody
- TxTags.portfolio.AllowIdentityToCreatePortfolios
- TxTags.portfolio.CreateCustodyPortfolio
- TxTags.portfolio.CreatePortfolio
- TxTags.portfolio.DeletePortfolio
- TxTags.portfolio.MovePortfolioFunds
- TxTags.portfolio.QuitPortfolioCustody
- TxTags.portfolio.RenamePortfolio
- TxTags.portfolio.RevokeCreatePortfoliosPermission

***

### REDEMPTION\_TX\_TAGS

> `const` **REDEMPTION\_TX\_TAGS**: \[`Redeem`, `RedeemNft`\]

Defined in: [types/txGroupConstants.ts:502](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L502)

Transaction tags for Redemption operations
Contains fungible asset and NFT redemption operations.

Values:
- TxTags.asset.Redeem
- TxTags.nft.RedeemNft

***

### SETTLEMENT\_MANAGEMENT\_TX\_TAGS

> `const` **SETTLEMENT\_MANAGEMENT\_TX\_TAGS**: \[`Approve`, `PreApproveAsset`, `ReceiverAffirmAssetTransfer`, `RejectAssetTransfer`, `RemoveAssetPreApproval`, `TransferAsset`, `Claim`, `TransferNft`, `PreApprovePortfolio`, `RemovePortfolioPreApproval`\]

Defined in: [types/txGroupConstants.ts:382](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L382)

Transaction tags for Settlement Management operations
Contains comprehensive settlement instruction, venue management, asset pre-approval, and investment operations.

Values:
- TxTags.asset.Approve
- TxTags.asset.PreApproveAsset
- TxTags.asset.ReceiverAffirmAssetTransfer
- TxTags.asset.RejectAssetTransfer
- TxTags.asset.RemoveAssetPreApproval
- TxTags.asset.TransferAsset
- TxTags.capitalDistribution.Claim
- TxTags.nft.TransferNft
- TxTags.portfolio.PreApprovePortfolio
- TxTags.portfolio.RemovePortfolioPreApproval
- TxTags.settlement.AddAndAffirmInstruction
- TxTags.settlement.AddAndAffirmWithMediators
- TxTags.settlement.AddInstruction
- TxTags.settlement.AddInstructionWithMediators
- TxTags.settlement.AffirmInstruction
- TxTags.settlement.AffirmInstructionWithCount
- TxTags.settlement.AffirmWithReceipts
- TxTags.settlement.AffirmWithReceiptsWithCount
- TxTags.settlement.CreateVenue
- TxTags.settlement.ExecuteManualInstruction
- TxTags.settlement.RejectInstruction
- TxTags.settlement.RejectInstructionWithCount
- TxTags.settlement.SetMandatoryReceiverAffirmation
- TxTags.settlement.TransferFunds
- TxTags.settlement.UpdateVenueDetails
- TxTags.settlement.UpdateVenueSigners
- TxTags.settlement.UpdateVenueType
- TxTags.sto.Invest

***

### STO\_MANAGEMENT\_TX\_TAGS

> `const` **STO\_MANAGEMENT\_TX\_TAGS**: \[`CreateFundraiser`, `EnableOffchainFunding`, `FreezeFundraiser`, `ModifyFundraiserWindow`, `Stop`, `UnfreezeFundraiser`\]

Defined in: [types/txGroupConstants.ts:519](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L519)

Transaction tags for STO Management operations
Contains operations for Security Token Offerings management.

Values:
- TxTags.sto.CreateFundraiser
- TxTags.sto.EnableOffchainFunding
- TxTags.sto.FreezeFundraiser
- TxTags.sto.ModifyFundraiserWindow
- TxTags.sto.Stop
- TxTags.sto.UnfreezeFundraiser

***

### TRUSTED\_CLAIM\_ISSUERS\_MANAGEMENT\_TX\_TAGS

> `const` **TRUSTED\_CLAIM\_ISSUERS\_MANAGEMENT\_TX\_TAGS**: \[`AddDefaultTrustedClaimIssuer`, `RemoveDefaultTrustedClaimIssuer`\]

Defined in: [types/txGroupConstants.ts:536](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L536)

Transaction tags for Trusted Claim Issuers Management operations
Contains operations for managing trusted claim issuers.

Values:
- TxTags.complianceManager.AddDefaultTrustedClaimIssuer
- TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer

***

### TX\_GROUP\_TO\_TAGS\_MAP

> `const` **TX\_GROUP\_TO\_TAGS\_MAP**: `Record`\<[`TxGroup`](../wiki/api.procedures.types#txgroup), `TxTag`[]\>

Defined in: [types/txGroupConstants.ts:546](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/txGroupConstants.ts#L546)

Mapping of transaction groups to their corresponding transaction tags
Used by txGroupToTxTags function for efficient lookups
Groups are ordered alphabetically for maintainability
