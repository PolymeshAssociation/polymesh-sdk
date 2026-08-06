[@polymeshassociation/polymesh-sdk](../wiki/README) / types/txGroupConstants

# types/txGroupConstants

## Variables

### ADVANCED\_ASSET\_MANAGEMENT\_TX\_TAGS

> `const` **ADVANCED\_ASSET\_MANAGEMENT\_TX\_TAGS**: \[`AcceptAssetOwnershipTransfer`, `ControllerTransfer`, `Freeze`, `Unfreeze`, `ControllerTransfer`\]

Defined in: [types/txGroupConstants.ts:18](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L18)

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

Defined in: [types/txGroupConstants.ts:513](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L513)

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

Defined in: [types/txGroupConstants.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L57)

Transaction tags for Asset Document Management operations
Contains operations for managing asset documents.

Values:
- TxTags.asset.AddDocuments
- TxTags.asset.RemoveDocuments

***

### ASSET\_MANAGEMENT\_TX\_TAGS

> `const` **ASSET\_MANAGEMENT\_TX\_TAGS**: \[`LinkTickerToAssetId`, `MakeDivisible`, `RenameAsset`, `SetFundingRound`, `UnlinkTickerFromAssetId`, `UpdateAssetType`, `UpdateIdentifiers`\]

Defined in: [types/txGroupConstants.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L39)

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

Defined in: [types/txGroupConstants.ts:72](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L72)

Transaction tags for Asset Metadata Management operations
Contains operations for managing asset metadata.

Values:
- TxTags.asset.RegisterAndSetLocalAssetMetadata
- TxTags.asset.RegisterAssetMetadataLocalType
- TxTags.asset.RemoveLocalMetadataKey
- TxTags.asset.RemoveMetadataValue

***

### ASSET\_REGISTRATION\_TX\_TAGS

> `const` **ASSET\_REGISTRATION\_TX\_TAGS**: \[`AcceptAssetOwnershipTransfer`, `AcceptTickerTransfer`, `CreateAsset`, `CreateAssetWithCustomType`, `RegisterCustomAssetType`, `RegisterUniqueTicker`, `CreateNftCollection`\]

Defined in: [types/txGroupConstants.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L94)

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

***

### AUTHORIZATION\_MANAGEMENT\_TX\_TAGS

> `const` **AUTHORIZATION\_MANAGEMENT\_TX\_TAGS**: \[`AddAuthorization`, `RemoveAuthorization`\]

Defined in: [types/txGroupConstants.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L112)

Transaction tags for Authorization Management operations
Contains operations for managing identity authorizations.

Values:
- TxTags.identity.AddAuthorization
- TxTags.identity.RemoveAuthorization

***

### CAPITAL\_DISTRIBUTION\_TX\_TAGS

> `const` **CAPITAL\_DISTRIBUTION\_TX\_TAGS**: \[`Distribute`, `PushBenefit`, `Reclaim`, `RemoveDistribution`\]

Defined in: [types/txGroupConstants.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L127)

Transaction tags for Capital Distribution operations
Contains operations for managing capital distributions.

Values:
- TxTags.capitalDistribution.Distribute
- TxTags.capitalDistribution.PushBenefit
- TxTags.capitalDistribution.Reclaim
- TxTags.capitalDistribution.RemoveDistribution

***

### CDD\_REGISTRATION\_TX\_TAGS

> `const` **CDD\_REGISTRATION\_TX\_TAGS**: \[`CddRegisterDid`, `CddRegisterDidWithCdd`\]

Defined in: [types/txGroupConstants.ts:142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L142)

Transaction tags for CDD Registration operations
Contains operations for Customer Due Diligence registration.

Values:
- TxTags.identity.CddRegisterDid
- TxTags.identity.CddRegisterDidWithCdd

***

### CHECKPOINT\_MANAGEMENT\_TX\_TAGS

> `const` **CHECKPOINT\_MANAGEMENT\_TX\_TAGS**: \[`CreateCheckpoint`, `CreateSchedule`, `RemoveSchedule`\]

Defined in: [types/txGroupConstants.ts:156](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L156)

Transaction tags for Checkpoint Management operations
Contains operations for creating and managing asset checkpoints.

Values:
- TxTags.checkpoint.CreateCheckpoint
- TxTags.checkpoint.CreateSchedule
- TxTags.checkpoint.RemoveSchedule

***

### CLAIMS\_MANAGEMENT\_TX\_TAGS

> `const` **CLAIMS\_MANAGEMENT\_TX\_TAGS**: \[`AddClaim`, `RegisterCustomClaimType`, `RevokeClaim`, `RevokeClaimByIndex`\]

Defined in: [types/txGroupConstants.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L172)

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

Defined in: [types/txGroupConstants.ts:201](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L201)

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

> `const` **CORPORATE\_ACTIONS\_MANAGEMENT\_TX\_TAGS**: \[`ChangeRecordDate`, `InitiateCorporateAction`, `InitiateCorporateActionAndDistribute`, `LinkCaDoc`, `RemoveCa`, `SetDefaultTargets`, `SetDefaultWithholdingTax`, `SetDidWithholdingTax`\]

Defined in: [types/txGroupConstants.ts:234](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L234)

Transaction tags for Corporate Actions Management operations
Contains operations for managing corporate actions.

Values:
- TxTags.corporateAction.ChangeRecordDate
- TxTags.corporateAction.InitiateCorporateAction
- TxTags.corporateAction.InitiateCorporateActionAndDistribute
- TxTags.corporateAction.LinkCaDoc
- TxTags.corporateAction.RemoveCa
- TxTags.corporateAction.SetDefaultTargets
- TxTags.corporateAction.SetDefaultWithholdingTax
- TxTags.corporateAction.SetDidWithholdingTax

***

### CORPORATE\_BALLOT\_MANAGEMENT\_TX\_TAGS

> `const` **CORPORATE\_BALLOT\_MANAGEMENT\_TX\_TAGS**: \[`AttachBallot`, `ChangeEnd`, `ChangeMeta`, `ChangeRcv`, `RemoveBallot`\]

Defined in: [types/txGroupConstants.ts:256](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L256)

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

Defined in: [types/txGroupConstants.ts:271](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L271)

Transaction tags for Corporate Voting operations
Contains operations for voting in corporate ballots.

Values:
- TxTags.corporateBallot.Vote

***

### EXTERNAL\_AGENT\_MANAGEMENT\_TX\_TAGS

> `const` **EXTERNAL\_AGENT\_MANAGEMENT\_TX\_TAGS**: \[`ChangeGroup`, `CreateAndChangeCustomGroup`, `CreateGroup`, `CreateGroupAndAddAuth`, `RemoveAgent`, `SetGroupPermissions`\]

Defined in: [types/txGroupConstants.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L287)

Transaction tags for External Agent Management operations
Contains operations for managing external agents and their permissions.

Values:
- TxTags.externalAgents.ChangeGroup
- TxTags.externalAgents.CreateAndChangeCustomGroup
- TxTags.externalAgents.CreateGroup
- TxTags.externalAgents.CreateGroupAndAddAuth
- TxTags.externalAgents.RemoveAgent
- TxTags.externalAgents.SetGroupPermissions

***

### EXTERNAL\_AGENT\_PARTICIPATION\_TX\_TAGS

> `const` **EXTERNAL\_AGENT\_PARTICIPATION\_TX\_TAGS**: \[`Abdicate`, `AcceptBecomeAgent`\]

Defined in: [types/txGroupConstants.ts:304](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L304)

Transaction tags for External Agent Participation operations
Contains operations for joining and leaving external agent roles.

Values:
- TxTags.externalAgents.Abdicate
- TxTags.externalAgents.AcceptBecomeAgent

***

### ISSUANCE\_TX\_TAGS

> `const` **ISSUANCE\_TX\_TAGS**: \[`Issue`, `IssueNft`\]

Defined in: [types/txGroupConstants.ts:358](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L358)

Transaction tags for Issuance operations
Contains fungible asset and NFT issuance operations.

Values:
- TxTags.asset.Issue
- TxTags.nft.IssueNft

***

### MULTISIG\_MANAGEMENT\_TX\_TAGS

> `const` **MULTISIG\_MANAGEMENT\_TX\_TAGS**: \[`CreateMultisig`\]

Defined in: [types/txGroupConstants.ts:370](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L370)

Transaction tags for MultiSig Management operations
Contains operations for managing multi-signature accounts.

Values:
- TxTags.multiSig.CreateMultisig

***

### PORTFOLIO\_MANAGEMENT\_TX\_TAGS

> `const` **PORTFOLIO\_MANAGEMENT\_TX\_TAGS**: \[`AcceptPortfolioCustody`, `CreateCustodyPortfolio`, `CreatePortfolio`, `DeletePortfolio`, `MovePortfolioFunds`, `MovePortfolioFundsV2`, `QuitPortfolioCustody`, `RenamePortfolio`\]

Defined in: [types/txGroupConstants.ts:388](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L388)

Transaction tags for Portfolio Management operations
Contains comprehensive portfolio management including creation, custody, movement, and operations.

Values:
- TxTags.portfolio.AcceptPortfolioCustody
- TxTags.portfolio.CreateCustodyPortfolio
- TxTags.portfolio.CreatePortfolio
- TxTags.portfolio.DeletePortfolio
- TxTags.portfolio.MovePortfolioFunds
- TxTags.portfolio.MovePortfolioFundsV2
- TxTags.portfolio.QuitPortfolioCustody
- TxTags.portfolio.RenamePortfolio

***

### REDEMPTION\_TX\_TAGS

> `const` **REDEMPTION\_TX\_TAGS**: \[`Redeem`, `RedeemNft`\]

Defined in: [types/txGroupConstants.ts:427](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L427)

Transaction tags for Redemption operations
Contains fungible asset and NFT redemption operations.

Values:
- TxTags.asset.Redeem
- TxTags.nft.RedeemNft

***

### RELAYER\_MANAGEMENT\_TX\_TAGS

> `const` **RELAYER\_MANAGEMENT\_TX\_TAGS**: \[`DecreasePolyxLimit`, `IncreasePolyxLimit`, `RemovePayingKey`, `SetPayingKey`, `UpdatePolyxLimit`\]

Defined in: [types/txGroupConstants.ts:411](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L411)

Transaction tags for Relayer Management operations
Contains operations for managing relayer and paying keys.

Values:
- TxTags.relayer.AcceptPayingKey
- TxTags.relayer.DecreasePolyxLimit
- TxTags.relayer.IncreasePolyxLimit
- TxTags.relayer.RemovePayingKey
- TxTags.relayer.SetPayingKey
- TxTags.relayer.UpdatePolyxLimit

***

### SETTLEMENT\_MANAGEMENT\_TX\_TAGS

> `const` **SETTLEMENT\_MANAGEMENT\_TX\_TAGS**: \[`PreApproveAsset`, `RemoveAssetPreApproval`, `Claim`, `AddAndAffirmInstruction`, `AddAndAffirmInstructionWithMemo`, `AddInstruction`, `AddInstructionWithMemo`, `AffirmInstruction`\]

Defined in: [types/txGroupConstants.ts:331](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L331)

Transaction tags for Settlement Management operations
Contains comprehensive settlement instruction, venue management, asset pre-approval, and investment operations.

Values:
- TxTags.asset.PreApproveAsset
- TxTags.asset.RemoveAssetPreApproval
- TxTags.capitalDistribution.Claim
- TxTags.settlement.AddAndAffirmInstruction
- TxTags.settlement.AddAndAffirmInstructionWithMemo
- TxTags.settlement.AddInstruction
- TxTags.settlement.AddInstructionWithMemo
- TxTags.settlement.AffirmInstruction
- TxTags.settlement.AffirmWithReceipts
- TxTags.settlement.CreateVenue
- TxTags.settlement.ExecuteManualInstruction
- TxTags.settlement.RejectInstruction
- TxTags.settlement.UpdateVenueDetails
- TxTags.settlement.UpdateVenueSigners
- TxTags.settlement.UpdateVenueType
- TxTags.sto.Invest

***

### STO\_MANAGEMENT\_TX\_TAGS

> `const` **STO\_MANAGEMENT\_TX\_TAGS**: \[`CreateFundraiser`, `FreezeFundraiser`, `ModifyFundraiserWindow`, `Stop`, `UnfreezeFundraiser`\]

Defined in: [types/txGroupConstants.ts:443](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L443)

Transaction tags for STO Management operations
Contains operations for Security Token Offerings management.

Values:
- TxTags.sto.CreateFundraiser
- TxTags.sto.FreezeFundraiser
- TxTags.sto.ModifyFundraiserWindow
- TxTags.sto.Stop
- TxTags.sto.UnfreezeFundraiser

***

### TRUSTED\_CLAIM\_ISSUERS\_MANAGEMENT\_TX\_TAGS

> `const` **TRUSTED\_CLAIM\_ISSUERS\_MANAGEMENT\_TX\_TAGS**: \[`AddDefaultTrustedClaimIssuer`, `RemoveDefaultTrustedClaimIssuer`\]

Defined in: [types/txGroupConstants.ts:459](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L459)

Transaction tags for Trusted Claim Issuers Management operations
Contains operations for managing trusted claim issuers.

Values:
- TxTags.complianceManager.AddDefaultTrustedClaimIssuer
- TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer

***

### TX\_GROUP\_TO\_TAGS\_MAP

> `const` **TX\_GROUP\_TO\_TAGS\_MAP**: `Record`\<[`TxGroup`](../wiki/api.procedures.types#txgroup), `TxTag`[]\>

Defined in: [types/txGroupConstants.ts:469](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/types/txGroupConstants.ts#L469)

Mapping of transaction groups to their corresponding transaction tags
Used by txGroupToTxTags function for efficient lookups
Groups are ordered alphabetically for maintainability
