# Enumeration: TxGroup

[api/procedures/types](../wiki/api.procedures.types).TxGroup

Transaction Groups (for permissions purposes)

## Table of contents

### Enumeration Members

- [AdvancedAssetManagement](../wiki/api.procedures.types.TxGroup#advancedassetmanagement)
- [AssetManagement](../wiki/api.procedures.types.TxGroup#assetmanagement)
- [ClaimsManagement](../wiki/api.procedures.types.TxGroup#claimsmanagement)
- [ComplianceRequirementsManagement](../wiki/api.procedures.types.TxGroup#compliancerequirementsmanagement)
- [CorporateActionsManagement](../wiki/api.procedures.types.TxGroup#corporateactionsmanagement)
- [Distribution](../wiki/api.procedures.types.TxGroup#distribution)
- [Issuance](../wiki/api.procedures.types.TxGroup#issuance)
- [PortfolioManagement](../wiki/api.procedures.types.TxGroup#portfoliomanagement)
- [StoManagement](../wiki/api.procedures.types.TxGroup#stomanagement)
- [TrustedClaimIssuersManagement](../wiki/api.procedures.types.TxGroup#trustedclaimissuersmanagement)

## Enumeration Members

### AdvancedAssetManagement

• **AdvancedAssetManagement** = ``"AdvancedAssetManagement"``

- TxTags.asset.Freeze
- TxTags.asset.Unfreeze
- TxTags.identity.AddAuthorization
- TxTags.identity.RemoveAuthorization

#### Defined in

[api/procedures/types.ts:346](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L346)

___

### AssetManagement

• **AssetManagement** = ``"AssetManagement"``

- TxTags.asset.MakeDivisible
- TxTags.asset.RenameAsset
- TxTags.asset.SetFundingRound
- TxTags.asset.AddDocuments
- TxTags.asset.RemoveDocuments

#### Defined in

[api/procedures/types.ts:339](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L339)

___

### ClaimsManagement

• **ClaimsManagement** = ``"ClaimsManagement"``

- TxTags.identity.AddClaim
- TxTags.identity.RevokeClaim

#### Defined in

[api/procedures/types.ts:369](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L369)

___

### ComplianceRequirementsManagement

• **ComplianceRequirementsManagement** = ``"ComplianceRequirementsManagement"``

- TxTags.complianceManager.AddComplianceRequirement
- TxTags.complianceManager.RemoveComplianceRequirement
- TxTags.complianceManager.PauseAssetCompliance
- TxTags.complianceManager.ResumeAssetCompliance
- TxTags.complianceManager.ResetAssetCompliance

#### Defined in

[api/procedures/types.ts:377](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L377)

___

### CorporateActionsManagement

• **CorporateActionsManagement** = ``"CorporateActionsManagement"``

- TxTags.checkpoint.CreateSchedule,
- TxTags.checkpoint.RemoveSchedule,
- TxTags.checkpoint.CreateCheckpoint,
- TxTags.corporateAction.InitiateCorporateAction,
- TxTags.capitalDistribution.Distribute,
- TxTags.capitalDistribution.Claim,
- TxTags.identity.AddInvestorUniquenessClaim,

#### Defined in

[api/procedures/types.ts:387](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L387)

___

### Distribution

• **Distribution** = ``"Distribution"``

- TxTags.identity.AddInvestorUniquenessClaim
- TxTags.settlement.CreateVenue
- TxTags.settlement.AddInstruction
- TxTags.settlement.AddInstructionWithMemo
- TxTags.settlement.AddAndAffirmInstruction
- TxTags.settlement.AddAndAffirmInstructionWithMemo

#### Defined in

[api/procedures/types.ts:355](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L355)

___

### Issuance

• **Issuance** = ``"Issuance"``

- TxTags.asset.Issue

#### Defined in

[api/procedures/types.ts:359](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L359)

___

### PortfolioManagement

• **PortfolioManagement** = ``"PortfolioManagement"``

- TxTags.identity.AddInvestorUniquenessClaim
- TxTags.portfolio.MovePortfolioFunds
- TxTags.settlement.AddInstruction
- TxTags.settlement.AddInstructionWithMemo
- TxTags.settlement.AddAndAffirmInstruction
- TxTags.settlement.AddAndAffirmInstructionWithMemo
- TxTags.settlement.AffirmInstruction
- TxTags.settlement.RejectInstruction
- TxTags.settlement.CreateVenue

#### Defined in

[api/procedures/types.ts:331](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L331)

___

### StoManagement

• **StoManagement** = ``"StoManagement"``

- TxTags.sto.CreateFundraiser,
- TxTags.sto.FreezeFundraiser,
- TxTags.sto.Invest,
- TxTags.sto.ModifyFundraiserWindow,
- TxTags.sto.Stop,
- TxTags.sto.UnfreezeFundraiser,
- TxTags.identity.AddInvestorUniquenessClaim,
- TxTags.asset.Issue,
- TxTags.settlement.CreateVenue

#### Defined in

[api/procedures/types.ts:399](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L399)

___

### TrustedClaimIssuersManagement

• **TrustedClaimIssuersManagement** = ``"TrustedClaimIssuersManagement"``

- TxTags.complianceManager.AddDefaultTrustedClaimIssuer
- TxTags.complianceManager.RemoveDefaultTrustedClaimIssuer

#### Defined in

[api/procedures/types.ts:364](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L364)
