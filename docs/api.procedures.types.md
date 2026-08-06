[@polymeshassociation/polymesh-sdk](../wiki/README) / api/procedures/types

# api/procedures/types

## Enumerations

### AllowanceOperation

Defined in: [api/procedures/types.ts:1739](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1739)

#### Enumeration Members

##### Decrease

> **Decrease**: `"Decrease"`

Defined in: [api/procedures/types.ts:1742](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1742)

##### Increase

> **Increase**: `"Increase"`

Defined in: [api/procedures/types.ts:1741](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1741)

##### Set

> **Set**: `"Set"`

Defined in: [api/procedures/types.ts:1740](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1740)

***

### ClaimOperation

Defined in: [api/procedures/types.ts:936](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L936)

#### Enumeration Members

##### Add

> **Add**: `"Add"`

Defined in: [api/procedures/types.ts:938](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L938)

##### Edit

> **Edit**: `"Edit"`

Defined in: [api/procedures/types.ts:939](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L939)

##### Revoke

> **Revoke**: `"Revoke"`

Defined in: [api/procedures/types.ts:937](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L937)

***

### InstructionAffirmationOperation

Defined in: [api/procedures/types.ts:1153](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1153)

#### Enumeration Members

##### Affirm

> **Affirm**: `"Affirm"`

Defined in: [api/procedures/types.ts:1154](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1154)

##### AffirmAsMediator

> **AffirmAsMediator**: `"AffirmAsMediator"`

Defined in: [api/procedures/types.ts:1160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1160)

##### Reject

> **Reject**: `"Reject"`

Defined in: [api/procedures/types.ts:1159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1159)

##### RejectAsMediator

> **RejectAsMediator**: `"RejectAsMediator"`

Defined in: [api/procedures/types.ts:1165](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1165)

##### ~~Withdraw~~

> **Withdraw**: `"Withdraw"`

Defined in: [api/procedures/types.ts:1158](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1158)

###### Deprecated

withdrawing an affirmation is no longer supported in chain v8

##### ~~WithdrawAsMediator~~

> **WithdrawAsMediator**: `"WithdrawAsMediator"`

Defined in: [api/procedures/types.ts:1164](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1164)

###### Deprecated

withdrawing an affirmation as a mediator is no longer supported in chain v8

***

### RoleType

Defined in: [api/procedures/types.ts:273](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L273)

#### Enumeration Members

##### ~~CddProvider~~

> **CddProvider**: `"CddProvider"`

Defined in: [api/procedures/types.ts:278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L278)

###### Deprecated

`CddProvider` role has been deprecated in favor of `DidRegistrar` role for chain v8

##### CorporateActionsAgent

> **CorporateActionsAgent**: `"CorporateActionsAgent"`

Defined in: [api/procedures/types.ts:281](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L281)

##### DidRegistrar

> **DidRegistrar**: `"DidRegistrar"`

Defined in: [api/procedures/types.ts:284](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L284)

##### Identity

> **Identity**: `"Identity"`

Defined in: [api/procedures/types.ts:283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L283)

##### PortfolioCustodian

> **PortfolioCustodian**: `"PortfolioCustodian"`

Defined in: [api/procedures/types.ts:280](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L280)

##### TickerOwner

> **TickerOwner**: `"TickerOwner"`

Defined in: [api/procedures/types.ts:274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L274)

##### VenueOwner

> **VenueOwner**: `"VenueOwner"`

Defined in: [api/procedures/types.ts:279](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L279)

***

### SignerKeyRingType

Defined in: [api/procedures/types.ts:1187](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1187)

#### Enumeration Members

##### Ecdsa

> **Ecdsa**: `"Ecdsa"`

Defined in: [api/procedures/types.ts:1190](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1190)

##### Ed25519

> **Ed25519**: `"Ed25519"`

Defined in: [api/procedures/types.ts:1188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1188)

##### Sr25519

> **Sr25519**: `"Sr25519"`

Defined in: [api/procedures/types.ts:1189](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1189)

***

### TransferRestrictionType

Defined in: [api/procedures/types.ts:571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L571)

#### Enumeration Members

##### ClaimCount

> **ClaimCount**: `"ClaimCount"`

Defined in: [api/procedures/types.ts:574](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L574)

##### ClaimPercentage

> **ClaimPercentage**: `"ClaimPercentage"`

Defined in: [api/procedures/types.ts:575](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L575)

##### Count

> **Count**: `"Count"`

Defined in: [api/procedures/types.ts:572](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L572)

##### Percentage

> **Percentage**: `"Percentage"`

Defined in: [api/procedures/types.ts:573](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L573)

***

### TxGroup

Defined in: [api/procedures/types.ts:334](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L334)

Transaction Groups (for secondary key permissions purposes)
Includes all transactions that agents can perform plus secondary key specific transactions

#### Enumeration Members

##### AdvancedAssetManagement

> **AdvancedAssetManagement**: `"AdvancedAssetManagement"`

Defined in: [api/procedures/types.ts:339](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L339)

Advanced Asset Management operations

###### See

[types/txGroupConstants!ADVANCED\_ASSET\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#advanced_asset_management_tx_tags) for the complete list of transactions

##### AssetDocumentManagement

> **AssetDocumentManagement**: `"AssetDocumentManagement"`

Defined in: [api/procedures/types.ts:351](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L351)

Asset Document Management operations

###### See

[types/txGroupConstants!ASSET\_DOCUMENT\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#asset_document_management_tx_tags) for the complete list of transactions

##### AssetManagement

> **AssetManagement**: `"AssetManagement"`

Defined in: [api/procedures/types.ts:345](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L345)

Asset management operations

###### See

[types/txGroupConstants!ASSET\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#asset_management_tx_tags) for the complete list of transactions

##### AssetMetadataManagement

> **AssetMetadataManagement**: `"AssetMetadataManagement"`

Defined in: [api/procedures/types.ts:357](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L357)

Asset Metadata Management operations

###### See

[types/txGroupConstants!ASSET\_METADATA\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#asset_metadata_management_tx_tags) for the complete list of transactions

##### AssetRegistration

> **AssetRegistration**: `"AssetRegistration"`

Defined in: [api/procedures/types.ts:363](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L363)

Asset Registration operations

###### See

[types/txGroupConstants!ASSET\_REGISTRATION\_TX\_TAGS](../wiki/types.txGroupConstants#asset_registration_tx_tags) for the complete list of transactions

##### AuthorizationManagement

> **AuthorizationManagement**: `"AuthorizationManagement"`

Defined in: [api/procedures/types.ts:369](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L369)

Authorization Management operations

###### See

[types/txGroupConstants!AUTHORIZATION\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#authorization_management_tx_tags) for the complete list of transactions

##### CapitalDistribution

> **CapitalDistribution**: `"CapitalDistribution"`

Defined in: [api/procedures/types.ts:375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L375)

Capital distribution management

###### See

[types/txGroupConstants!CAPITAL\_DISTRIBUTION\_TX\_TAGS](../wiki/types.txGroupConstants#capital_distribution_tx_tags) for the complete list of transactions

##### CddRegistration

> **CddRegistration**: `"CddRegistration"`

Defined in: [api/procedures/types.ts:381](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L381)

CDD Registration operations

###### See

[types/txGroupConstants!CDD\_REGISTRATION\_TX\_TAGS](../wiki/types.txGroupConstants#cdd_registration_tx_tags) for the complete list of transactions

##### CheckpointManagement

> **CheckpointManagement**: `"CheckpointManagement"`

Defined in: [api/procedures/types.ts:387](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L387)

Checkpoint management

###### See

[types/txGroupConstants!CHECKPOINT\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#checkpoint_management_tx_tags) for the complete list of transactions

##### ClaimsManagement

> **ClaimsManagement**: `"ClaimsManagement"`

Defined in: [api/procedures/types.ts:393](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L393)

Claims Management operations

###### See

[types/txGroupConstants!CLAIMS\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#claims_management_tx_tags) for the complete list of transactions

##### ComplianceManagement

> **ComplianceManagement**: `"ComplianceManagement"`

Defined in: [api/procedures/types.ts:399](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L399)

Compliance management operations

###### See

[types/txGroupConstants!COMPLIANCE\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#compliance_management_tx_tags) for the complete list of transactions

##### CorporateActionsManagement

> **CorporateActionsManagement**: `"CorporateActionsManagement"`

Defined in: [api/procedures/types.ts:405](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L405)

Corporate actions management

###### See

[types/txGroupConstants!CORPORATE\_ACTIONS\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#corporate_actions_management_tx_tags) for the complete list of transactions

##### CorporateBallotManagement

> **CorporateBallotManagement**: `"CorporateBallotManagement"`

Defined in: [api/procedures/types.ts:411](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L411)

Corporate ballot management

###### See

[types/txGroupConstants!CORPORATE\_BALLOT\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#corporate_ballot_management_tx_tags) for the complete list of transactions

##### CorporateVoting

> **CorporateVoting**: `"CorporateVoting"`

Defined in: [api/procedures/types.ts:417](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L417)

Corporate voting operations

###### See

[types/txGroupConstants!CORPORATE\_VOTING\_TX\_TAGS](../wiki/types.txGroupConstants#corporate_voting_tx_tags) for the complete list of transactions

##### ExternalAgentManagement

> **ExternalAgentManagement**: `"ExternalAgentManagement"`

Defined in: [api/procedures/types.ts:423](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L423)

External Agent Management operations

###### See

[types/txGroupConstants!EXTERNAL\_AGENT\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#external_agent_management_tx_tags) for the complete list of transactions

##### ExternalAgentParticipation

> **ExternalAgentParticipation**: `"ExternalAgentParticipation"`

Defined in: [api/procedures/types.ts:429](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L429)

External Agent Participation operations

###### See

[types/txGroupConstants!EXTERNAL\_AGENT\_PARTICIPATION\_TX\_TAGS](../wiki/types.txGroupConstants#external_agent_participation_tx_tags) for the complete list of transactions

##### Issuance

> **Issuance**: `"Issuance"`

Defined in: [api/procedures/types.ts:435](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L435)

Issuance operations

###### See

[types/txGroupConstants!ISSUANCE\_TX\_TAGS](../wiki/types.txGroupConstants#issuance_tx_tags) for the complete list of transactions

##### MultiSigManagement

> **MultiSigManagement**: `"MultiSigManagement"`

Defined in: [api/procedures/types.ts:441](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L441)

MultiSig account management

###### See

[types/txGroupConstants!MULTISIG\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#multisig_management_tx_tags) for the complete list of transactions

##### PortfolioManagement

> **PortfolioManagement**: `"PortfolioManagement"`

Defined in: [api/procedures/types.ts:447](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L447)

Portfolio management operations

###### See

[types/txGroupConstants!PORTFOLIO\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#portfolio_management_tx_tags) for the complete list of transactions

##### Redemption

> **Redemption**: `"Redemption"`

Defined in: [api/procedures/types.ts:459](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L459)

Redemption operations

###### See

[types/txGroupConstants!REDEMPTION\_TX\_TAGS](../wiki/types.txGroupConstants#redemption_tx_tags) for the complete list of transactions

##### RelayerManagement

> **RelayerManagement**: `"RelayerManagement"`

Defined in: [api/procedures/types.ts:453](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L453)

Relayer Management operations

###### See

[types/txGroupConstants!RELAYER\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#relayer_management_tx_tags) for the complete list of transactions

##### SettlementManagement

> **SettlementManagement**: `"SettlementManagement"`

Defined in: [api/procedures/types.ts:465](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L465)

Settlement Management operations

###### See

[types/txGroupConstants!SETTLEMENT\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#settlement_management_tx_tags) for the complete list of transactions

##### StoManagement

> **StoManagement**: `"StoManagement"`

Defined in: [api/procedures/types.ts:471](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L471)

STO Management operations

###### See

[types/txGroupConstants!STO\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#sto_management_tx_tags) for the complete list of transactions

##### TrustedClaimIssuersManagement

> **TrustedClaimIssuersManagement**: `"TrustedClaimIssuersManagement"`

Defined in: [api/procedures/types.ts:477](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L477)

Trusted Claim Issuers Management operations

###### See

[types/txGroupConstants!TRUSTED\_CLAIM\_ISSUERS\_MANAGEMENT\_TX\_TAGS](../wiki/types.txGroupConstants#trusted_claim_issuers_management_tx_tags) for the complete list of transactions

## Interfaces

### AcceptPrimaryKeyRotationParams

Defined in: [api/procedures/types.ts:706](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L706)

#### Properties

##### ~~cddAuth?~~

> `optional` **cddAuth?**: `BigNumber` \| [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)

Defined in: [api/procedures/types.ts:715](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L715)

(optional) Authorization from a CDD service provider attesting the rotation of primary key

###### Deprecated

this value will be ignored from chain v8

##### ownerAuth

> **ownerAuth**: `BigNumber` \| [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)

Defined in: [api/procedures/types.ts:710](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L710)

Authorization from the owner who initiated the change

***

### AcceptSubsidyParams

Defined in: [api/procedures/types.ts:767](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L767)

#### Properties

##### subsidizer

> **subsidizer**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:771](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L771)

Account providing the subsidy

***

### AccountWithSignature

Defined in: [api/procedures/types.ts:732](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L732)

#### Properties

##### authSignature

> **authSignature**: `string`

Defined in: [api/procedures/types.ts:752](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L752)

Off-chain authorization signature generated by `secondaryAccount` signing of the target Id authorization

Target Id authorization consists of the target Identity (to which the secondary account will be added),
off chain authorization nonce of the target Identity and expiry date (same as `expiresAt` value) until which the off chain authorization will be valid.
Signature has to be generated encoding the target Id authorization value in the specified order.

###### Note

Nonce value can be fetched using [Identity.getOffChainAuthorizationNonce](../wiki/api.entities.Identity#getoffchainauthorizationnonce)
Signature can also be generated using the method [accountManagement.generateOffChainAuthSignature](../wiki/api.client.AccountManagement#generateoffchainauthsignature)

##### secondaryAccount

> **secondaryAccount**: [`Modify`](../wiki/types.utils#modify)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount), \{ `account`: `string` \| [`Account`](../wiki/api.entities.Account#account); `permissions`: [`PermissionsLike`](../wiki/api.entities.types#permissionslike); \}\>

Defined in: [api/procedures/types.ts:738](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L738)

The secondary Account along with its permissions to be added

###### Note

This account should not be linked to any other Identity

***

### AddAssetDocumentsParams

Defined in: [api/procedures/types.ts:1601](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1601)

#### Properties

##### documents

> **documents**: [`AssetDocument`](../wiki/api.entities.Asset.types#assetdocument)[]

Defined in: [api/procedures/types.ts:1605](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1605)

documents to add to the asset

***

### AddAssetRequirementParams

Defined in: [api/procedures/types.ts:1465](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1465)

#### Properties

##### conditions

> **conditions**: [`InputCondition`](../wiki/api.entities.types#inputcondition)[]

Defined in: [api/procedures/types.ts:1471](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1471)

array of conditions that form the requirement that must be added.
  Conditions within a requirement are *AND* between them. This means that in order
  for a transfer to comply with this requirement, it must fulfill *ALL* conditions

***

### AddClaimsParams

Defined in: [api/procedures/types.ts:942](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L942)

#### Properties

##### claims

> **claims**: [`ClaimTarget`](../wiki/api.entities.types#claimtarget)[]

Defined in: [api/procedures/types.ts:946](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L946)

array of claims to be added

##### operation

> **operation**: [`Add`](../wiki/#add)

Defined in: [api/procedures/types.ts:947](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L947)

***

### AddInstructionsParams

Defined in: [api/procedures/types.ts:1138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1138)

#### Properties

##### instructions

> **instructions**: [`AddInstructionParams`](../wiki/#addinstructionparams)[]

Defined in: [api/procedures/types.ts:1142](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1142)

array of Instructions to be added in the Venue

***

### AddInvestorUniquenessClaimParams

Defined in: [api/procedures/types.ts:977](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L977)

#### Properties

##### cddId

> **cddId**: `string`

Defined in: [api/procedures/types.ts:979](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L979)

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:982](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L982)

##### proof

> **proof**: `string` \| [`ScopeClaimProof`](../wiki/#scopeclaimproof)

Defined in: [api/procedures/types.ts:980](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L980)

##### scope

> **scope**: [`Scope`](../wiki/api.entities.types#scope-9)

Defined in: [api/procedures/types.ts:978](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L978)

##### scopeId

> **scopeId**: `string`

Defined in: [api/procedures/types.ts:981](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L981)

***

### AddSecondaryAccountsParams

Defined in: [api/procedures/types.ts:755](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L755)

#### Properties

##### accounts

> **accounts**: [`AccountWithSignature`](../wiki/#accountwithsignature)[]

Defined in: [api/procedures/types.ts:764](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L764)

List of accounts to be added as secondary accounts along with their off chain authorization signatures

##### expiresAt

> **expiresAt**: `Date`

Defined in: [api/procedures/types.ts:759](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L759)

Expiry date until which all the off chain authorizations received from each account is valid

***

### ApproveAllowanceParams

Defined in: [api/procedures/types.ts:2165](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2165)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:2174](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2174)

Maximum amount the `spender` may transfer. Passing `0` will revoke the approval. Balance::MAX = unlimited.

##### spender

> **spender**: [`AccountLike`](../wiki/api.entities.types#accountlike)

Defined in: [api/procedures/types.ts:2169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2169)

Account authorized to spend the Asset

***

### AssetBase

Defined in: [api/procedures/types.ts:1829](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1829)

#### Extended by

- [`TransactionsParams`](../wiki/#transactionsparams)
- [`TxGroupParams`](../wiki/#txgroupparams)

#### Properties

##### asset

> **asset**: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/procedures/types.ts:1833](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1833)

Asset over which the Identity will be granted permissions

***

### AssetMediatorParams

Defined in: [api/procedures/types.ts:1987](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1987)

#### Properties

##### mediators

> **mediators**: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]

Defined in: [api/procedures/types.ts:1988](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1988)

***

### AttestPrimaryKeyRotationParams

Defined in: [api/procedures/types.ts:1012](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1012)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1026](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1026)

(optional) when the generated authorization should expire

##### identity

> **identity**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1021](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1021)

Identity or the DID of the Identity that is to be rotated

##### targetAccount

> **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1016](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1016)

The Account that will be attested to become the primary key of the `identity`. Can be ss58 encoded address or an instance of Account

***

### BondPolyxParams

Defined in: [api/procedures/types.ts:2003](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2003)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:2027](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2027)

The amount of POLYX to bond (up to 6 decimals of precision)

###### Note

It is strongly recommended against bonding 100% an account's POLYX balance.
At the minimum a stash account needs enough POLYX to sign the unbond extrinsic ()

##### autoStake

> **autoStake**: `boolean`

Defined in: [api/procedures/types.ts:2019](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2019)

Can be set to `true` if `rewardDestination` is the signing account. Auto stake will stake all rewards so the balance will compound

##### controller

> **controller**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:2009](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2009)

The controller is the account responsible for managing staked POLYX. This can be the stash,
but designating a different key can make it easier to update nomination preferences and maintain
the POLYX in a more secure, but inconvenient, stash key.

##### payee

> **payee**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:2014](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2014)

The account that should receive the stashing rewards

***

### CddProviderRole

Defined in: [api/procedures/types.ts:292](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L292)

#### Properties

##### type

> **type**: [`CddProvider`](../wiki/#cddprovider)

Defined in: [api/procedures/types.ts:293](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L293)

***

### ChildKeyWithAuth

Defined in: [api/procedures/types.ts:1947](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1947)

#### Properties

##### authSignature

> **authSignature**: `` `0x${string}` ``

Defined in: [api/procedures/types.ts:1964](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1964)

Off-chain authorization signature generated by `key` signing of the target Id authorization

Target Id authorization consists of the target Identity (which will become the parent of the child Identity),
off chain authorization nonce of the target Identity and expiry date (same as `expiresAt` value) until which the off chain authorization will be valid.
Signature has to be generated encoding the target Id authorization value in the specified order.

###### Note

Nonce value can be fetched using [Identity.getOffChainAuthorizationNonce](../wiki/api.entities.Identity#getoffchainauthorizationnonce)
Signature can also be generated using the method [accountManagement.generateOffChainAuthSignature](../wiki/api.client.AccountManagement#generateoffchainauthsignature)

##### key

> **key**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1953](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1953)

The key that will become the primary key of the new child Identity

###### Note

This key should not be linked to any other Identity

***

### ClaimCountRestrictionValue

Defined in: [api/procedures/types.ts:578](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L578)

#### Properties

##### claim

> **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

Defined in: [api/procedures/types.ts:582](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L582)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:581](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L581)

##### max?

> `optional` **max?**: `BigNumber`

Defined in: [api/procedures/types.ts:580](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L580)

##### min

> **min**: `BigNumber`

Defined in: [api/procedures/types.ts:579](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L579)

***

### ClaimCountTransferRestrictionInput

Defined in: [api/procedures/types.ts:628](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L628)

#### Properties

##### claim

> **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

Defined in: [api/procedures/types.ts:632](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L632)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:631](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L631)

##### max?

> `optional` **max?**: `BigNumber`

Defined in: [api/procedures/types.ts:630](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L630)

##### min

> **min**: `BigNumber`

Defined in: [api/procedures/types.ts:629](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L629)

##### type

> **type**: [`ClaimCount`](../wiki/#claimcount)

Defined in: [api/procedures/types.ts:633](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L633)

***

### ClaimPercentageRestrictionValue

Defined in: [api/procedures/types.ts:585](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L585)

#### Properties

##### claim

> **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

Defined in: [api/procedures/types.ts:589](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L589)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:588](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L588)

##### max

> **max**: `BigNumber`

Defined in: [api/procedures/types.ts:587](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L587)

##### min

> **min**: `BigNumber`

Defined in: [api/procedures/types.ts:586](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L586)

***

### ClaimPercentageTransferRestrictionInput

Defined in: [api/procedures/types.ts:635](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L635)

#### Properties

##### claim

> **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

Defined in: [api/procedures/types.ts:639](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L639)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:638](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L638)

##### max

> **max**: `BigNumber`

Defined in: [api/procedures/types.ts:637](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L637)

##### min

> **min**: `BigNumber`

Defined in: [api/procedures/types.ts:636](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L636)

##### type

> **type**: [`ClaimPercentage`](../wiki/#claimpercentage)

Defined in: [api/procedures/types.ts:640](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L640)

***

### ConfigureDividendDistributionParams

Defined in: [api/procedures/types.ts:1542](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1542)

#### Properties

##### checkpoint

> **checkpoint**: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint)

Defined in: [api/procedures/types.ts:1567](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1567)

checkpoint to be used to calculate Dividends. If a Schedule is passed, the next Checkpoint it creates will be used.
  If a Date is passed, a Checkpoint will be created at that date and used

##### currency

> **currency**: `string`

Defined in: [api/procedures/types.ts:1575](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1575)

ticker of the currency in which Dividends will be distributed

##### declarationDate?

> `optional` **declarationDate?**: `Date`

Defined in: [api/procedures/types.ts:1546](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1546)

date at which the issuer publicly declared the Dividend Distribution. Optional, defaults to the current date

##### defaultTaxWithholding?

> `optional` **defaultTaxWithholding?**: `BigNumber`

Defined in: [api/procedures/types.ts:1557](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1557)

default percentage (0-100) of the Benefits to be held for tax purposes

##### description

> **description**: `string`

Defined in: [api/procedures/types.ts:1547](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1547)

##### expiryDate?

> `optional` **expiryDate?**: `Date`

Defined in: [api/procedures/types.ts:1591](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1591)

optional, defaults to never expiring

##### maxAmount

> **maxAmount**: `BigNumber`

Defined in: [api/procedures/types.ts:1583](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1583)

maximum amount of `currency` to distribute in total

##### originPortfolio?

> `optional` **originPortfolio?**: `BigNumber` \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/procedures/types.ts:1571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1571)

portfolio from which the Dividends will be distributed. Optional, defaults to the Dividend Distributions Agent's Default Portfolio

##### paymentDate

> **paymentDate**: `Date`

Defined in: [api/procedures/types.ts:1587](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1587)

date from which Asset Holders can claim their Dividends

##### perShare

> **perShare**: `BigNumber`

Defined in: [api/procedures/types.ts:1579](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1579)

amount of `currency` to distribute per each share of the Asset that a target holds

##### targets?

> `optional` **targets?**: [`InputCorporateActionTargets`](../wiki/#inputcorporateactiontargets)

Defined in: [api/procedures/types.ts:1553](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1553)

Asset Holder Identities to be included (or excluded) from the Dividend Distribution. Inclusion/exclusion is controlled by the `treatment`
  property. When the value is `Include`, all Asset Holders not present in the array are excluded, and vice-versa. If no value is passed,
  the default value for the Asset is used. If there is no default value, all Asset Holders will be part of the Dividend Distribution

##### taxWithholdings?

> `optional` **taxWithholdings?**: [`InputCorporateActionTaxWithholdings`](../wiki/#inputcorporateactiontaxwithholdings)

Defined in: [api/procedures/types.ts:1562](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1562)

percentage (0-100) of the Benefits to be held for tax purposes from individual Asset Holder Identities.
  This overrides the value of `defaultTaxWithholding`

***

### ControllerTransferParams

Defined in: [api/procedures/types.ts:1290](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1290)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:1298](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1298)

amount of Asset tokens to transfer

##### destination?

> `optional` **destination?**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1303](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1303)

(optional) portfolio (or portfolio ID) or account to which Assets will be transferred to. Defaults to default portfolio. If specified it must be one of the callers own portfolios or accounts

##### originPortfolio

> **originPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

Defined in: [api/procedures/types.ts:1294](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1294)

portfolio (or portfolio ID) from which Assets will be transferred

***

### CountTransferRestrictionInput

Defined in: [api/procedures/types.ts:612](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L612)

#### Properties

##### count

> **count**: `BigNumber`

Defined in: [api/procedures/types.ts:616](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L616)

limit on the amount of different (unique) investors that can hold the Asset at once

##### type

> **type**: [`Count`](../wiki/#count)

Defined in: [api/procedures/types.ts:617](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L617)

***

### CreateAssetParams

Defined in: [api/procedures/types.ts:792](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L792)

#### Extended by

- [`CreateAssetWithTickerParams`](../wiki/#createassetwithtickerparams)

#### Properties

##### assetType

> **assetType**: `string` \| `BigNumber`

Defined in: [api/procedures/types.ts:812](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L812)

Type of security that the Asset represents (e.g., Equity, Debt, Commodity). Common values are included in the
  [types!KnownAssetType](../wiki/api.entities.Asset.types#knownassettype) enum, but custom values can be used as well. Custom values must be registered on-chain the first time
  they're used, requiring an additional transaction. They aren't tied to a specific Asset.
  If using a custom type, it can be provided as a string (representing name) or a BigNumber (representing the custom type ID).

##### documents?

> `optional` **documents?**: [`AssetDocument`](../wiki/api.entities.Asset.types#assetdocument)[]

Defined in: [api/procedures/types.ts:821](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L821)

##### fundingRound?

> `optional` **fundingRound?**: `string`

Defined in: [api/procedures/types.ts:820](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L820)

(Optional) funding round in which the Asset currently is (e.g., Series A, Series B).

##### initialStatistics?

> `optional` **initialStatistics?**: [`InputStatType`](../wiki/api.entities.types#inputstattype)[]

Defined in: [api/procedures/types.ts:834](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L834)

(Optional) type of statistics that should be enabled for the Asset.

Enabling statistics allows for TransferRestrictions to be made. For example, the SEC requires registration for a company that
has either more than 2000 investors or more than 500 non-accredited investors. To prevent crossing this limit, two restrictions are
needed: a `Count` of 2000, and a `ScopedCount` of non-accredited with a maximum of 500. [source](https://www.sec.gov/info/smallbus/secg/jobs-act-section-12g-small-business-compliance-guide.htm)

These restrictions require a `Count` and `ScopedCount` statistic to be created. Although they can be created after the Asset is made, it is recommended to create statistics
before the Asset is circulated. Count statistics made after Asset creation need their initial value set, so it is simpler to create them before investors hold the Asset.
If you need to create a stat for an Asset after creation, you can use the [TransferRestrictions.setStats](../wiki/api.entities.Asset.Fungible.TransferRestrictions#setstats) method in the [TransferRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions#transferrestrictions) namespace.

##### initialSupply?

> `optional` **initialSupply?**: `BigNumber`

Defined in: [api/procedures/types.ts:797](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L797)

Amount of Asset tokens to be minted on creation (optional; by default, no tokens are minted).

##### isDivisible

> **isDivisible**: `boolean`

Defined in: [api/procedures/types.ts:805](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L805)

Whether a single Asset token can be divided into decimal parts.

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:793](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L793)

##### portfolioId?

> `optional` **portfolioId?**: `BigNumber`

Defined in: [api/procedures/types.ts:801](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L801)

Portfolio to which the Asset tokens will be issued on creation (optional; defaults to the default portfolio).

##### securityIdentifiers?

> `optional` **securityIdentifiers?**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]

Defined in: [api/procedures/types.ts:816](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L816)

Array of domestic or international alphanumeric security identifiers for the Asset (e.g., ISIN, CUSIP, FIGI).

***

### CreateAssetWithTickerParams

Defined in: [api/procedures/types.ts:855](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L855)

#### Extends

- [`CreateAssetParams`](../wiki/#createassetparams)

#### Properties

##### assetType

> **assetType**: `string` \| `BigNumber`

Defined in: [api/procedures/types.ts:812](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L812)

Type of security that the Asset represents (e.g., Equity, Debt, Commodity). Common values are included in the
  [types!KnownAssetType](../wiki/api.entities.Asset.types#knownassettype) enum, but custom values can be used as well. Custom values must be registered on-chain the first time
  they're used, requiring an additional transaction. They aren't tied to a specific Asset.
  If using a custom type, it can be provided as a string (representing name) or a BigNumber (representing the custom type ID).

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`assetType`](../wiki/#assettype)

##### documents?

> `optional` **documents?**: [`AssetDocument`](../wiki/api.entities.Asset.types#assetdocument)[]

Defined in: [api/procedures/types.ts:821](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L821)

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`documents`](../wiki/#documents-1)

##### fundingRound?

> `optional` **fundingRound?**: `string`

Defined in: [api/procedures/types.ts:820](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L820)

(Optional) funding round in which the Asset currently is (e.g., Series A, Series B).

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`fundingRound`](../wiki/#fundinground)

##### initialStatistics?

> `optional` **initialStatistics?**: [`InputStatType`](../wiki/api.entities.types#inputstattype)[]

Defined in: [api/procedures/types.ts:834](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L834)

(Optional) type of statistics that should be enabled for the Asset.

Enabling statistics allows for TransferRestrictions to be made. For example, the SEC requires registration for a company that
has either more than 2000 investors or more than 500 non-accredited investors. To prevent crossing this limit, two restrictions are
needed: a `Count` of 2000, and a `ScopedCount` of non-accredited with a maximum of 500. [source](https://www.sec.gov/info/smallbus/secg/jobs-act-section-12g-small-business-compliance-guide.htm)

These restrictions require a `Count` and `ScopedCount` statistic to be created. Although they can be created after the Asset is made, it is recommended to create statistics
before the Asset is circulated. Count statistics made after Asset creation need their initial value set, so it is simpler to create them before investors hold the Asset.
If you need to create a stat for an Asset after creation, you can use the [TransferRestrictions.setStats](../wiki/api.entities.Asset.Fungible.TransferRestrictions#setstats) method in the [TransferRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions#transferrestrictions) namespace.

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`initialStatistics`](../wiki/#initialstatistics)

##### initialSupply?

> `optional` **initialSupply?**: `BigNumber`

Defined in: [api/procedures/types.ts:797](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L797)

Amount of Asset tokens to be minted on creation (optional; by default, no tokens are minted).

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`initialSupply`](../wiki/#initialsupply)

##### isDivisible

> **isDivisible**: `boolean`

Defined in: [api/procedures/types.ts:805](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L805)

Whether a single Asset token can be divided into decimal parts.

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`isDivisible`](../wiki/#isdivisible)

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:793](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L793)

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`name`](../wiki/#name)

##### portfolioId?

> `optional` **portfolioId?**: `BigNumber`

Defined in: [api/procedures/types.ts:801](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L801)

Portfolio to which the Asset tokens will be issued on creation (optional; defaults to the default portfolio).

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`portfolioId`](../wiki/#portfolioid)

##### securityIdentifiers?

> `optional` **securityIdentifiers?**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]

Defined in: [api/procedures/types.ts:816](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L816)

Array of domestic or international alphanumeric security identifiers for the Asset (e.g., ISIN, CUSIP, FIGI).

###### Inherited from

[`CreateAssetParams`](../wiki/#createassetparams).[`securityIdentifiers`](../wiki/#securityidentifiers)

##### ticker?

> `optional` **ticker?**: `string`

Defined in: [api/procedures/types.ts:861](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L861)

(optional) ticker to be linked with the Asset

###### Note

from 7.x chain, ticker has been made optional. For 6.x chain, it is still mandatory.

***

### CreateBallotParams

Defined in: [api/procedures/types.ts:2063](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2063)

#### Properties

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/procedures/types.ts:2094](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2094)

Date on which the Corporate Action is declared

##### description

> **description**: `string`

Defined in: [api/procedures/types.ts:2082](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2082)

Description of the Corporate Action to which the Ballot is attached

##### endDate

> **endDate**: `Date`

Defined in: [api/procedures/types.ts:2077](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2077)

Date when Ballot voting ends

##### meta

> **meta**: [`BallotMeta`](../wiki/api.entities.CorporateBallot.types#ballotmeta)

Defined in: [api/procedures/types.ts:2067](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2067)

Title and motions of the Ballot

##### rcv

> **rcv**: `boolean`

Defined in: [api/procedures/types.ts:2099](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2099)

Specifies whether Ranked Choice Voting (RCV) is enabled for this ballot.

##### startDate

> **startDate**: `Date`

Defined in: [api/procedures/types.ts:2072](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2072)

Date when Ballot voting starts

##### targets?

> `optional` **targets?**: [`InputCorporateActionTargets`](../wiki/#inputcorporateactiontargets)

Defined in: [api/procedures/types.ts:2089](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2089)

Asset Holder Identities to be included (or excluded) from the Ballot. Inclusion/exclusion is controlled by the `treatment`
  property. When the value is `Include`, all Asset Holders not present in the array are excluded, and vice-versa. If no value is passed,
  the default value for the Asset is used. If there is no default value, all Asset Holders will be part of the Ballot

***

### CreateCheckpointScheduleParams

Defined in: [api/procedures/types.ts:1451](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1451)

#### Properties

##### points

> **points**: `Date`[]

Defined in: [api/procedures/types.ts:1455](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1455)

The points in time in the future for which to create checkpoints for

***

### CreateChildIdentitiesParams

Defined in: [api/procedures/types.ts:1967](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1967)

#### Properties

##### childKeyAuths

> **childKeyAuths**: [`ChildKeyWithAuth`](../wiki/#childkeywithauth)[]

Defined in: [api/procedures/types.ts:1976](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1976)

List of child keys along with their off chain authorization signatures

##### expiresAt

> **expiresAt**: `Date`

Defined in: [api/procedures/types.ts:1971](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1971)

Expiry date until which all the off chain authorizations received from each key will be valid

***

### CreateChildIdentityParams

Defined in: [api/procedures/types.ts:1940](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1940)

#### Properties

##### secondaryKey

> **secondaryKey**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1944](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1944)

The secondary key that will become the primary key of the new child Identity

***

### CreateGroupParams

Defined in: [api/procedures/types.ts:1655](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1655)

#### Properties

##### permissions

> **permissions**: \{ `transactions`: [`TransactionPermissions`](../wiki/api.entities.types#transactionpermissions); \} \| \{ `transactionGroups`: ([`AdvancedAssetManagement`](../wiki/#advancedassetmanagement) \| [`AssetManagement`](../wiki/#assetmanagement) \| [`AssetDocumentManagement`](../wiki/#assetdocumentmanagement) \| [`AssetMetadataManagement`](../wiki/#assetmetadatamanagement) \| [`CapitalDistribution`](../wiki/#capitaldistribution) \| [`CheckpointManagement`](../wiki/#checkpointmanagement) \| [`ComplianceManagement`](../wiki/#compliancemanagement) \| [`CorporateActionsManagement`](../wiki/#corporateactionsmanagement) \| [`CorporateBallotManagement`](../wiki/#corporateballotmanagement) \| [`ExternalAgentManagement`](../wiki/#externalagentmanagement) \| [`Issuance`](../wiki/#issuance) \| [`Redemption`](../wiki/#redemption) \| [`StoManagement`](../wiki/#stomanagement) \| [`TrustedClaimIssuersManagement`](../wiki/#trustedclaimissuersmanagement))[]; \}

Defined in: [api/procedures/types.ts:1656](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1656)

***

### CreateMultiSigParams

Defined in: [api/procedures/types.ts:1884](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1884)

#### Properties

##### permissions?

> `optional` **permissions?**: [`PermissionsLike`](../wiki/api.entities.types#permissionslike)

Defined in: [api/procedures/types.ts:1893](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1893)

Grants permissions to the MultiSig upon creation. The caller must be the primary key of the Identity for these to work

##### requiredSignatures

> **requiredSignatures**: `BigNumber`

Defined in: [api/procedures/types.ts:1889](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1889)

##### signers

> **signers**: [`Signer`](../wiki/api.entities.types#signer)[]

Defined in: [api/procedures/types.ts:1888](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1888)

###### Note

Signer must be an Account as of v7

***

### CreateNftCollectionParams

Defined in: [api/procedures/types.ts:880](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L880)

#### Properties

##### assetId?

> `optional` **assetId?**: `string`

Defined in: [api/procedures/types.ts:887](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L887)

The ID of the asset to be used to create the collection.
If no assetId is provided, a new asset with `NonFungible` asset type will be created

###### Note

for spec version before 7.x, this value is overwritten by `ticker` value

##### collectionKeys

> **collectionKeys**: [`CollectionKeyInput`](../wiki/#collectionkeyinput)[]

Defined in: [api/procedures/types.ts:916](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L916)

The required metadata values each NFT in the collection will have

###### Note

Images — Most Polymesh networks (mainnet, testnet, etc.) have global metadata keys registered to help standardize displaying images
If `imageUri` is specified as a collection key, then each token will need to be issued with an image URI.

##### documents?

> `optional` **documents?**: [`AssetDocument`](../wiki/api.entities.Asset.types#assetdocument)[]

Defined in: [api/procedures/types.ts:920](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L920)

Links to off chain documents related to the NftCollection

##### fundingRound?

> `optional` **fundingRound?**: `string`

Defined in: [api/procedures/types.ts:925](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L925)

A optional field that can be used to provide information about the funding state of the asset

##### name?

> `optional` **name?**: `string`

Defined in: [api/procedures/types.ts:900](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L900)

The collection name. defaults to `ticker`

##### nftType

> **nftType**: `string` \| `BigNumber`

Defined in: [api/procedures/types.ts:905](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L905)

###### Throws

if provided string that does not have a custom type

###### Throws

if provided a BigNumber that does not correspond to a custom type

##### securityIdentifiers?

> `optional` **securityIdentifiers?**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]

Defined in: [api/procedures/types.ts:909](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L909)

array of domestic or international alphanumeric security identifiers for the Asset (e.g. ISIN, CUSIP, FIGI)

##### ticker?

> `optional` **ticker?**: `string`

Defined in: [api/procedures/types.ts:896](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L896)

The primary identifier for the collection.
The ticker must either be free, or the signer has appropriate permissions if reserved.

Since spec version 7.x, this value (if provided) is then linked to `assetId` asset

###### Note

This value is mandatory for spec version before 7.x

***

### CreateTransactionBatchParams

Defined in: [api/procedures/types.ts:1880](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1880)

#### Type Parameters

| Type Parameter |
| ------ |
| `ReturnValues` *extends* readonly \[`...unknown[]`\] |

#### Properties

##### transactions

> **transactions**: `Readonly`\<[`TransactionArray`](../wiki/#transactionarray)\<`ReturnValues`\>\>

Defined in: [api/procedures/types.ts:1881](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1881)

***

### CreateTransactionBatchProcedureMethod()

Defined in: [api/procedures/types.ts:183](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L183)

> **CreateTransactionBatchProcedureMethod**\<`ReturnValues`\>(`args`, `opts?`): `Promise`\<[`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch#polymeshtransactionbatch)\<`ReturnValues`, `ReturnValues`, `unknown`[][]\>\>

Defined in: [api/procedures/types.ts:184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L184)

#### Type Parameters

| Type Parameter |
| ------ |
| `ReturnValues` *extends* readonly `unknown`[] |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/#createtransactionbatchparams)\<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

#### Returns

`Promise`\<[`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch#polymeshtransactionbatch)\<`ReturnValues`, `ReturnValues`, `unknown`[][]\>\>

#### Properties

##### checkAuthorization

> **checkAuthorization**: \<`ReturnValues`\>(`args`, `opts?`) => `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

Defined in: [api/procedures/types.ts:188](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L188)

###### Type Parameters

| Type Parameter |
| ------ |
| `ReturnValues` *extends* `unknown`[] |

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/#createtransactionbatchparams)\<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

###### Returns

`Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

***

### CreateVenueParams

Defined in: [api/procedures/types.ts:1277](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1277)

#### Properties

##### description

> **description**: `string`

Defined in: [api/procedures/types.ts:1278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1278)

##### signers?

> `optional` **signers?**: (`string` \| [`Account`](../wiki/api.entities.Account#account))[]

Defined in: [api/procedures/types.ts:1283](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1283)

(optional) list of signers that are allowed to sign receipts for this venue

##### type

> **type**: [`VenueType`](../wiki/api.entities.Venue.types#venuetype)

Defined in: [api/procedures/types.ts:1279](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1279)

***

### DecreaseAllowanceParams

Defined in: [api/procedures/types.ts:1753](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1753)

#### Properties

##### allowance

> **allowance**: `BigNumber`

Defined in: [api/procedures/types.ts:1757](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1757)

amount of POLYX to decrease the allowance by

##### operation

> **operation**: [`Decrease`](../wiki/#decrease)

Defined in: [api/procedures/types.ts:1758](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1758)

***

### DidRegistrarRole

Defined in: [api/procedures/types.ts:296](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L296)

#### Properties

##### type

> **type**: [`DidRegistrar`](../wiki/#didregistrar)

Defined in: [api/procedures/types.ts:297](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L297)

***

### EditClaimsParams

Defined in: [api/procedures/types.ts:950](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L950)

#### Properties

##### claims

> **claims**: [`ClaimTarget`](../wiki/api.entities.types#claimtarget)[]

Defined in: [api/procedures/types.ts:954](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L954)

array of claims to be edited

##### operation

> **operation**: [`Edit`](../wiki/#edit)

Defined in: [api/procedures/types.ts:955](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L955)

***

### EnableOffChainFundingParams

Defined in: [api/procedures/types.ts:2158](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2158)

#### Properties

##### offChainTicker

> **offChainTicker**: `string`

Defined in: [api/procedures/types.ts:2162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2162)

The ticker of the off-chain asset

***

### ExecuteManualInstructionParams

Defined in: [api/procedures/types.ts:1270](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1270)

#### Properties

##### skipAffirmationCheck?

> `optional` **skipAffirmationCheck?**: `boolean`

Defined in: [api/procedures/types.ts:1274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1274)

(optional) Set to `true` to skip affirmation check, useful for batch transactions

***

### GlobalCollectionKeyInput

Defined in: [api/procedures/types.ts:864](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L864)

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/procedures/types.ts:866](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L866)

##### type

> **type**: [`Global`](../wiki/api.entities.MetadataEntry.types#global)

Defined in: [api/procedures/types.ts:865](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L865)

***

### IdentityRole

Defined in: [api/procedures/types.ts:317](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L317)

#### Properties

##### did

> **did**: `string`

Defined in: [api/procedures/types.ts:319](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L319)

##### type

> **type**: [`Identity`](../wiki/#identity)

Defined in: [api/procedures/types.ts:318](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L318)

***

### ImmortalProcedureOptValue

Defined in: [api/procedures/types.ts:156](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L156)

This transaction will never expire

#### Properties

##### immortal

> `readonly` **immortal**: `true`

Defined in: [api/procedures/types.ts:157](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L157)

***

### IncreaseAllowanceParams

Defined in: [api/procedures/types.ts:1745](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1745)

#### Properties

##### allowance

> **allowance**: `BigNumber`

Defined in: [api/procedures/types.ts:1749](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1749)

amount of POLYX to increase the allowance by

##### operation

> **operation**: [`Increase`](../wiki/#increase)

Defined in: [api/procedures/types.ts:1750](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1750)

***

### InstructionFungibleLeg

Defined in: [api/procedures/types.ts:1068](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1068)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:1069](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1069)

##### asset

> **asset**: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/procedures/types.ts:1072](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1072)

##### from

> **from**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1070](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1070)

##### to

> **to**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1071](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1071)

***

### InstructionIdParams

Defined in: [api/procedures/types.ts:1149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1149)

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/procedures/types.ts:1150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1150)

***

### InstructionNftLeg

Defined in: [api/procedures/types.ts:1075](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1075)

#### Properties

##### asset

> **asset**: `string` \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)

Defined in: [api/procedures/types.ts:1079](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1079)

##### from

> **from**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1077](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1077)

##### nfts

> **nfts**: (`BigNumber` \| [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft))[]

Defined in: [api/procedures/types.ts:1076](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1076)

##### to

> **to**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1078](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1078)

***

### InstructionOffChainLeg

Defined in: [api/procedures/types.ts:1082](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1082)

#### Properties

##### asset

> **asset**: `string`

Defined in: [api/procedures/types.ts:1088](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1088)

the ticker of the off chain asset

##### from

> **from**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1083](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1083)

##### offChainAmount

> **offChainAmount**: `BigNumber`

Defined in: [api/procedures/types.ts:1089](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1089)

##### to

> **to**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1084](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1084)

***

### InviteAccountParams

Defined in: [api/procedures/types.ts:700](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L700)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:703](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L703)

##### permissions?

> `optional` **permissions?**: [`PermissionsLike`](../wiki/api.entities.types#permissionslike)

Defined in: [api/procedures/types.ts:702](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L702)

##### targetAccount

> **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:701](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L701)

***

### InviteExternalAgentParams

Defined in: [api/procedures/types.ts:1665](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1665)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1682](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1682)

date at which the authorization request for invitation expires (optional)

###### Note

if expiry date is not set, the invitation will never expire

###### Note

due to chain limitations, the expiry will be ignored if the passed `permissions` don't correspond to an existing Permission Group

##### permissions

> **permissions**: [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup) \| \{ `transactions`: [`TransactionPermissions`](../wiki/api.entities.types#transactionpermissions) \| `null`; \} \| \{ `transactionGroups`: ([`AdvancedAssetManagement`](../wiki/#advancedassetmanagement) \| [`AssetManagement`](../wiki/#assetmanagement) \| [`AssetDocumentManagement`](../wiki/#assetdocumentmanagement) \| [`AssetMetadataManagement`](../wiki/#assetmetadatamanagement) \| [`CapitalDistribution`](../wiki/#capitaldistribution) \| [`CheckpointManagement`](../wiki/#checkpointmanagement) \| [`ComplianceManagement`](../wiki/#compliancemanagement) \| [`CorporateActionsManagement`](../wiki/#corporateactionsmanagement) \| [`CorporateBallotManagement`](../wiki/#corporateballotmanagement) \| [`ExternalAgentManagement`](../wiki/#externalagentmanagement) \| [`Issuance`](../wiki/#issuance) \| [`Redemption`](../wiki/#redemption) \| [`StoManagement`](../wiki/#stomanagement) \| [`TrustedClaimIssuersManagement`](../wiki/#trustedclaimissuersmanagement))[]; \}

Defined in: [api/procedures/types.ts:1667](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1667)

##### target

> **target**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1666](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1666)

***

### IssueTokensParams

Defined in: [api/procedures/types.ts:837](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L837)

#### Properties

##### account?

> `optional` **account?**: `string`

Defined in: [api/procedures/types.ts:852](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L852)

(optional) Account to which the Asset tokens will be issued

###### Note

only one of `portfolioId` or `account` can be provided. If both are not provided, assets are issued in default portfolio

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:841](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L841)

amount of Asset tokens to be issued

##### portfolioId?

> `optional` **portfolioId?**: `BigNumber`

Defined in: [api/procedures/types.ts:845](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L845)

portfolio to which the Asset tokens will be issued (optional, default is the default portfolio)

***

### LaunchOfferingParams

Defined in: [api/procedures/types.ts:1615](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1615)

#### Properties

##### end?

> `optional` **end?**: `Date`

Defined in: [api/procedures/types.ts:1643](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1643)

end date of the Offering (optional, defaults to never)

##### minInvestment

> **minInvestment**: `BigNumber`

Defined in: [api/procedures/types.ts:1652](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1652)

minimum amount that can be spent on this offering

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:1635](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1635)

##### offeringPortfolio

> **offeringPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

Defined in: [api/procedures/types.ts:1619](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1619)

portfolio in which the Asset tokens to be sold are stored

##### raisingCurrency

> **raisingCurrency**: `string`

Defined in: [api/procedures/types.ts:1628](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1628)

ticker symbol of the currency in which the funds are being raised (e.g. 'USD' or 'CAD').
  Other Assets can be used as currency as well

##### raisingPortfolio

> **raisingPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

Defined in: [api/procedures/types.ts:1623](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1623)

portfolio in which the raised funds will be stored

##### start?

> `optional` **start?**: `Date`

Defined in: [api/procedures/types.ts:1639](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1639)

start date of the Offering (optional, defaults to right now)

##### tiers

> **tiers**: [`OfferingTier`](../wiki/api.entities.Offering.types#offeringtier)[]

Defined in: [api/procedures/types.ts:1648](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1648)

array of sale tiers. Each tier consists of an amount of Assets to be sold at a certain price.
  Tokens in a tier can only be bought when all tokens in previous tiers have been bought

##### venue?

> `optional` **venue?**: [`Venue`](../wiki/api.entities.Venue#venue)

Defined in: [api/procedures/types.ts:1634](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1634)

venue through which all offering related trades will be settled
  (optional, defaults to the first `Sto` type Venue owned by the owner of the Offering Portfolio.
  If passed, it must be of type `Sto`)

***

### LinkCaDocsParams

Defined in: [api/procedures/types.ts:1689](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1689)

#### Properties

##### documents

> **documents**: [`AssetDocument`](../wiki/api.entities.Asset.types#assetdocument)[]

Defined in: [api/procedures/types.ts:1693](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1693)

list of documents

***

### LinkTickerToAssetParams

Defined in: [api/procedures/types.ts:1696](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1696)

#### Properties

##### ticker

> **ticker**: `string`

Defined in: [api/procedures/types.ts:1700](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1700)

The ticker to attach

***

### LocalCollectionKeyInput

Defined in: [api/procedures/types.ts:869](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L869)

#### Properties

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:871](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L871)

##### spec

> **spec**: [`MetadataSpec`](../wiki/api.entities.MetadataEntry.types#metadataspec)

Defined in: [api/procedures/types.ts:872](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L872)

##### type

> **type**: [`Local`](../wiki/api.entities.MetadataEntry.types#local)

Defined in: [api/procedures/types.ts:870](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L870)

***

### ModifyAssetTrustedClaimIssuersAddSetParams

Defined in: [api/procedures/types.ts:1499](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1499)

#### Properties

##### claimIssuers

> **claimIssuers**: [`InputTrustedClaimIssuer`](../wiki/api.entities.types#inputtrustedclaimissuer)[]

Defined in: [api/procedures/types.ts:1500](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1500)

***

### ModifyAssetTrustedClaimIssuersRemoveParams

Defined in: [api/procedures/types.ts:1503](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1503)

#### Properties

##### claimIssuers

> **claimIssuers**: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]

Defined in: [api/procedures/types.ts:1507](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1507)

array of Identities (or DIDs) of the default claim issuers

***

### ModifyCaCheckpointParams

Defined in: [api/procedures/types.ts:1703](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1703)

#### Properties

##### checkpoint

> **checkpoint**: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint) \| `null`

Defined in: [api/procedures/types.ts:1704](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1704)

***

### ModifyCorporateActionsAgentParams

Defined in: [api/procedures/types.ts:1514](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1514)

#### Properties

##### requestExpiry?

> `optional` **requestExpiry?**: `Date`

Defined in: [api/procedures/types.ts:1522](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1522)

date at which the authorization request to modify the Corporate Actions Agent expires (optional, never expires if a date is not provided)

##### target

> **target**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1518](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1518)

Identity to be set as Corporate Actions Agent

***

### ModifyMultiSigParams

Defined in: [api/procedures/types.ts:1896](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1896)

#### Properties

##### multiSig

> **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig#multisig)

Defined in: [api/procedures/types.ts:1900](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1900)

The MultiSig to be modified

##### requiredSignatures?

> `optional` **requiredSignatures?**: `BigNumber`

Defined in: [api/procedures/types.ts:1908](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1908)

The required number of signatures for the MultiSig

##### signers?

> `optional` **signers?**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/procedures/types.ts:1904](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1904)

The signer accounts to set for the MultiSig

***

### ModifyPrimaryIssuanceAgentParams

Defined in: [api/procedures/types.ts:1396](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1396)

#### Properties

##### requestExpiry?

> `optional` **requestExpiry?**: `Date`

Defined in: [api/procedures/types.ts:1404](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1404)

date at which the authorization request to modify the primary issuance agent expires (optional, never expires if a date is not provided)

##### target

> **target**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1400](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1400)

Identity to be set as primary issuance agent

***

### ModifySignerPermissionsParams

Defined in: [api/procedures/types.ts:718](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L718)

#### Properties

##### secondaryAccounts

> **secondaryAccounts**: [`Modify`](../wiki/types.utils#modify)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount), \{ `account`: `string` \| [`Account`](../wiki/api.entities.Account#account); `permissions`: [`PermissionsLike`](../wiki/api.entities.types#permissionslike); \}\>[]

Defined in: [api/procedures/types.ts:722](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L722)

list of secondary Accounts

***

### MortalProcedureOptValue

Defined in: [api/procedures/types.ts:163](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L163)

This transaction will be rejected if not included in a block after a while (default: ~5 minutes)

#### Properties

##### immortal

> `readonly` **immortal**: `false`

Defined in: [api/procedures/types.ts:164](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L164)

##### lifetime?

> `readonly` `optional` **lifetime?**: `BigNumber`

Defined in: [api/procedures/types.ts:171](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L171)

The number of blocks the for which the transaction remains valid. Target block time is 6 seconds. The default should suffice for most use cases

###### Note

this value will get rounded up to the closest power of 2, e.g. `65` rounds up to `128`

###### Note

this value should not exceed 4096, which is the chain's `BlockHashCount` as the lesser of the two will be used.

***

### MoveFundsParams

Defined in: [api/procedures/types.ts:1869](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1869)

#### Properties

##### items

> **items**: [`PortfolioMovement`](../wiki/api.entities.types#portfoliomovement)[]

Defined in: [api/procedures/types.ts:1877](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1877)

list of Assets (and the corresponding token amounts) that will be moved

##### to?

> `optional` **to?**: `BigNumber` \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/procedures/types.ts:1873](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1873)

portfolio (or portfolio ID) that will receive the funds. Optional, if no value is passed, the funds will be moved to the default Portfolio of this Portfolio's owner

***

### MultiSigProcedureOpt

Defined in: [api/procedures/types.ts:174](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L174)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L178)

The block number for which the proposal expires

***

### NftControllerTransferParams

Defined in: [api/procedures/types.ts:1306](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1306)

#### Properties

##### destination?

> `optional` **destination?**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1328](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1328)

(optional) portfolio (or portfolio ID) or account to which Assets will be transferred to. Defaults to default portfolio. If specified it must be one of the callers own portfolios or accounts

###### Note

this takes precedence over `destinationPortfolio`

##### ~~destinationPortfolio?~~

> `optional` **destinationPortfolio?**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

Defined in: [api/procedures/types.ts:1321](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1321)

Optional portfolio (or portfolio ID) to which NFTs will be transferred to. Defaults to default portfolio. If specified it must be one of the callers own portfolios

###### Deprecated

in favour of `destination`. If both are passed `destination` will take precedence

##### nfts

> **nfts**: (`BigNumber` \| [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft))[]

Defined in: [api/procedures/types.ts:1314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1314)

The NFTs to transfer

##### originPortfolio

> **originPortfolio**: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike)

Defined in: [api/procedures/types.ts:1310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1310)

portfolio (or portfolio ID) from which NFTs will be transferred from

***

### NoArgsProcedureMethod()

Defined in: [api/procedures/types.ts:222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L222)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `ProcedureReturnValue` | - |
| `ReturnValue` | `ProcedureReturnValue` |

> **NoArgsProcedureMethod**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

Defined in: [api/procedures/types.ts:223](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L223)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

#### Properties

##### checkAuthorization

> **checkAuthorization**: (`opts?`) => `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

Defined in: [api/procedures/types.ts:224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L224)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

###### Returns

`Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

***

### NominateValidatorsParams

Defined in: [api/procedures/types.ts:2059](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2059)

#### Properties

##### validators

> **validators**: (`string` \| [`Account`](../wiki/api.entities.Account#account))[]

Defined in: [api/procedures/types.ts:2060](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2060)

***

### OffChainAffirmationReceipt

Defined in: [api/procedures/types.ts:1202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1202)

#### Properties

##### expiresAt?

> `optional` **expiresAt?**: `Date`

Defined in: [api/procedures/types.ts:1226](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1226)

Timestamp at which the receipt expires. Mandatory from chain 8.x onwards

##### legId

> **legId**: `BigNumber`

Defined in: [api/procedures/types.ts:1210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1210)

Index of the off chain leg within the instruction to be affirmed

##### metadata

> **metadata**: `string` \| `undefined`

Defined in: [api/procedures/types.ts:1222](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1222)

(optional) Metadata value that can be used to attach messages to the receipt

##### signature

> **signature**: [`OffChainSignature`](../wiki/#offchainsignature)

Defined in: [api/procedures/types.ts:1218](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1218)

Signature confirming the receipt details

##### signer

> **signer**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1214](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1214)

Signer of this receipt

##### uid

> **uid**: `BigNumber`

Defined in: [api/procedures/types.ts:1206](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1206)

Unique receipt number set by the signer for their receipts

***

### OffChainSignature

Defined in: [api/procedures/types.ts:1193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1193)

#### Properties

##### type

> **type**: [`SignerKeyRingType`](../wiki/#signerkeyringtype)

Defined in: [api/procedures/types.ts:1194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1194)

##### value

> **value**: `` `0x${string}` ``

Defined in: [api/procedures/types.ts:1199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1199)

The off chain signature value.
NOTE: The off chain payload should be wrapped with bytes before signing. For e.g. `<Bytes>Off chain payload</Bytes>` should be signed to get the signature value

***

### OptionalArgsProcedureMethod()

Defined in: [api/procedures/types.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L208)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `MethodArgs` | - |
| `ProcedureReturnValue` | - |
| `ReturnValue` | `ProcedureReturnValue` |

> **OptionalArgsProcedureMethod**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

Defined in: [api/procedures/types.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L213)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | `MethodArgs` |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

#### Properties

##### checkAuthorization

> **checkAuthorization**: (`args?`, `opts?`) => `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

Defined in: [api/procedures/types.ts:216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L216)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args?` | `MethodArgs` |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

###### Returns

`Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

***

### PayDividendsParams

Defined in: [api/procedures/types.ts:1860](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1860)

#### Properties

##### targets

> **targets**: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]

Defined in: [api/procedures/types.ts:1861](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1861)

***

### PercentageTransferRestrictionInput

Defined in: [api/procedures/types.ts:620](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L620)

#### Properties

##### percentage

> **percentage**: `BigNumber`

Defined in: [api/procedures/types.ts:624](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L624)

maximum percentage (0-100) of the total supply of the Asset that can be held by a single investor at once

##### type

> **type**: [`Percentage`](../wiki/#percentage)

Defined in: [api/procedures/types.ts:625](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L625)

***

### PortfolioCustodianRole

Defined in: [api/procedures/types.ts:312](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L312)

#### Properties

##### portfolioId

> **portfolioId**: [`PortfolioId`](../wiki/#portfolioid-4)

Defined in: [api/procedures/types.ts:314](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L314)

##### type

> **type**: [`PortfolioCustodian`](../wiki/#portfoliocustodian)

Defined in: [api/procedures/types.ts:313](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L313)

***

### PortfolioId

Defined in: [api/procedures/types.ts:305](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L305)

#### Properties

##### did

> **did**: `string`

Defined in: [api/procedures/types.ts:306](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L306)

##### number?

> `optional` **number?**: `BigNumber`

Defined in: [api/procedures/types.ts:307](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L307)

***

### ProcedureAuthorizationStatus

Defined in: [api/procedures/types.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L69)

#### Properties

##### accountFrozen

> **accountFrozen**: `boolean`

Defined in: [api/procedures/types.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L85)

whether the Account is frozen (i.e. can't perform any transactions)

##### agentPermissions

> **agentPermissions**: [`CheckPermissionsResult`](../wiki/api.entities.types#checkpermissionsresult)\<[`Identity`](../wiki/api.entities.types#identity-1)\>

Defined in: [api/procedures/types.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L73)

whether the Identity complies with all required Agent permissions

##### noIdentity

> **noIdentity**: `boolean`

Defined in: [api/procedures/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L90)

true only if the Procedure requires an Identity but the signing Account
  doesn't have one associated

##### roles

> **roles**: [`CheckRolesResult`](../wiki/api.entities.types#checkrolesresult)

Defined in: [api/procedures/types.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L81)

whether the Identity complies with all required Roles

##### signerPermissions

> **signerPermissions**: [`CheckPermissionsResult`](../wiki/api.entities.types#checkpermissionsresult)\<[`Account`](../wiki/api.entities.types#account)\>

Defined in: [api/procedures/types.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L77)

whether the Account complies with all required Signer permissions

***

### ProcedureMethod()

Defined in: [api/procedures/types.ts:194](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L194)

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `MethodArgs` | - |
| `ProcedureReturnValue` | - |
| `ReturnValue` | `ProcedureReturnValue` |

> **ProcedureMethod**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

Defined in: [api/procedures/types.ts:199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L199)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `MethodArgs` |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

#### Properties

##### checkAuthorization

> **checkAuthorization**: (`args`, `opts?`) => `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

Defined in: [api/procedures/types.ts:202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L202)

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `MethodArgs` |
| `opts?` | [`ProcedureOpts`](../wiki/#procedureopts) |

###### Returns

`Promise`\<[`ProcedureAuthorizationStatus`](../wiki/#procedureauthorizationstatus)\>

***

### ProcedureOpts

Defined in: [api/procedures/types.ts:116](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L116)

#### Properties

##### mortality?

> `optional` **mortality?**: [`MortalityProcedureOpt`](../wiki/#mortalityprocedureopt)

Defined in: [api/procedures/types.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L136)

This option allows for transactions that never expire, aka "immortal". By default, a transaction is only valid for approximately 5 minutes (250 blocks) after its construction. Allows for transaction construction to be decoupled from its submission, such as requiring manual approval for the signing or providing "at least once" guarantees.

More information can be found [here](https://wiki.polkadot.network/docs/build-protocol-info#transaction-mortality). Note the Polymesh chain will **never** reap Accounts, so the risk of a replay attack is mitigated.

##### multiSigOpts?

> `optional` **multiSigOpts?**: [`MultiSigProcedureOpt`](../wiki/#multisigprocedureopt)

Defined in: [api/procedures/types.ts:141](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L141)

These options will only apply when the `signingAccount` is a MultiSig signer and the transaction is being wrapped as a proposal

##### nonce?

> `optional` **nonce?**: `BigNumber` \| `Promise`\<`BigNumber`\> \| (() => `BigNumber` \| `Promise`\<`BigNumber`\>)

Defined in: [api/procedures/types.ts:129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L129)

nonce value for signing the transaction

An [api/entities/Account!Account](../wiki/api.entities.Account#account) can directly fetch its current nonce by calling [account.getCurrentNonce](../wiki/api.entities.Account#getcurrentnonce). More information can be found at: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce

###### Note

the passed value can be either the nonce itself or a function that returns the nonce. This allows, for example, passing a closure that increases the returned value every time it's called, or a function that fetches the nonce from the chain or a different source

##### signingAccount?

> `optional` **signingAccount?**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L120)

Account or address of a signing key to replace the current one (for this procedure only)

##### skipChecks?

> `optional` **skipChecks?**: [`SkipChecksOpt`](../wiki/#skipchecksopt)

Defined in: [api/procedures/types.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L150)

This option allows for skipping checks for the Procedure. By default, all checks are performed.

This can be useful while batching transactions which could have failed due to insufficient roles or permissions individually, but you don't want to fail the entire batch.

###### Note

even if the checks are skipped from being validated on the SDK, they will still be validated on the chain

***

### RedeemNftParams

Defined in: [api/procedures/types.ts:1427](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1427)

#### Properties

##### from?

> `optional` **from?**: `BigNumber` \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/procedures/types.ts:1433](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1433)

portfolio (or portfolio ID) from which Assets will be redeemed (optional, defaults to the default Portfolio)

###### Note

either `from` or `fromAccount` must be provided

##### fromAccount?

> `optional` **fromAccount?**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1440](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1440)

(optional) Account from which Assets will be redeemed

###### Note

only one of `from` or `fromAccount` can be provided. If none are provided, defaults to the default Portfolio

***

### RedeemTokensParams

Defined in: [api/procedures/types.ts:1407](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1407)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:1411](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1411)

amount of Asset tokens to be redeemed

##### from?

> `optional` **from?**: `BigNumber` \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)

Defined in: [api/procedures/types.ts:1417](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1417)

portfolio (or portfolio ID) from which Assets will be redeemed (optional, defaults to the default Portfolio)

###### Note

either `from` or `fromAccount` must be provided

##### fromAccount?

> `optional` **fromAccount?**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1424](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1424)

(optional) Account from which Assets will be redeemed

###### Note

either `from` or `fromAccount` must be provided. `fromAccount` takes precedence over `from`

***

### RegisterCustomAssetTypeParams

Defined in: [api/procedures/types.ts:1999](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1999)

#### Properties

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:2000](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2000)

***

### RegisterCustomClaimTypeParams

Defined in: [api/procedures/types.ts:1983](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1983)

#### Properties

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:1984](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1984)

***

### RegisterDidParams

Defined in: [api/procedures/types.ts:1005](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1005)

#### Properties

##### targetAccount

> **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1009](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1009)

The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account

***

### RegisterIdentityParams

Defined in: [api/procedures/types.ts:985](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L985)

#### Properties

##### createCdd?

> `optional` **createCdd?**: `boolean`

Defined in: [api/procedures/types.ts:998](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L998)

(optional) also issue a CDD claim for the created DID, completing the onboarding process for the Account

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1002](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1002)

(optional) when the generated CDD claim should expire, `createCdd` must be true if specified

##### secondaryAccounts?

> `optional` **secondaryAccounts?**: [`Modify`](../wiki/types.utils#modify)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount), \{ `permissions`: [`PermissionsLike`](../wiki/api.entities.types#permissionslike); \}\>[]

Defined in: [api/procedures/types.ts:994](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L994)

(optional) secondary accounts for the new Identity with their corresponding permissions.

###### Note

Each Account will need to accept the generated authorizations before being linked to the Identity

##### targetAccount

> **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:989](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L989)

The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account

***

### RemoveAssetDocumentsParams

Defined in: [api/procedures/types.ts:1608](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1608)

#### Properties

##### documentIds

> **documentIds**: `BigNumber`[]

Defined in: [api/procedures/types.ts:1612](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1612)

IDs of documents to remove from the asset

***

### RemoveAssetRequirementParams

Defined in: [api/procedures/types.ts:1487](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1487)

#### Properties

##### requirement

> **requirement**: `BigNumber` \| [`Requirement`](../wiki/api.entities.types#requirement)

Defined in: [api/procedures/types.ts:1488](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1488)

***

### RemoveCheckpointScheduleParams

Defined in: [api/procedures/types.ts:1458](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1458)

#### Properties

##### schedule

> **schedule**: `BigNumber` \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule#checkpointschedule)

Defined in: [api/procedures/types.ts:1462](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1462)

schedule (or ID) of the schedule to be removed

***

### RemoveCorporateActionParams

Defined in: [api/procedures/types.ts:1510](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1510)

#### Properties

##### corporateAction

> **corporateAction**: `BigNumber` \| [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase#abstract-corporateactionbase)

Defined in: [api/procedures/types.ts:1511](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1511)

***

### RemoveExternalAgentParams

Defined in: [api/procedures/types.ts:1685](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1685)

#### Properties

##### target

> **target**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1686](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1686)

***

### RemoveSecondaryAccountsParams

Defined in: [api/procedures/types.ts:728](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L728)

#### Properties

##### accounts

> **accounts**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/procedures/types.ts:729](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L729)

***

### RenamePortfolioParams

Defined in: [api/procedures/types.ts:1821](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1821)

#### Properties

##### name

> **name**: `string`

Defined in: [api/procedures/types.ts:1822](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1822)

***

### ReserveTickerParams

Defined in: [api/procedures/types.ts:928](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L928)

#### Properties

##### extendPeriod?

> `optional` **extendPeriod?**: `boolean`

Defined in: [api/procedures/types.ts:933](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L933)

##### ticker

> **ticker**: `string`

Defined in: [api/procedures/types.ts:932](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L932)

ticker symbol to reserve

***

### RevokeClaimsParams

Defined in: [api/procedures/types.ts:958](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L958)

#### Properties

##### claims

> **claims**: `Omit`\<[`ClaimTarget`](../wiki/api.entities.types#claimtarget), `"expiry"`\>[]

Defined in: [api/procedures/types.ts:962](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L962)

array of claims to be revoked

##### operation

> **operation**: [`Revoke`](../wiki/#revoke)

Defined in: [api/procedures/types.ts:963](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L963)

***

### RevokeSubsidyParams

Defined in: [api/procedures/types.ts:774](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L774)

#### Properties

##### beneficiary

> **beneficiary**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:778](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L778)

Account whose pending subsidy will be revoked

***

### RotatePrimaryKeyParams

Defined in: [api/procedures/types.ts:1029](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1029)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1038](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1038)

(optional) when the generated authorization should expire

##### targetAccount

> **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1033](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1033)

The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account

***

### ScopeClaimProof

Defined in: [api/procedures/types.ts:968](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L968)

#### Properties

##### proofScopeIdCddIdMatch

> **proofScopeIdCddIdMatch**: `object`

Defined in: [api/procedures/types.ts:970](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L970)

###### blindedScopeDidHash

> **blindedScopeDidHash**: `string`

###### challengeResponses

> **challengeResponses**: \[`string`, `string`\]

###### subtractExpressionsRes

> **subtractExpressionsRes**: `string`

##### proofScopeIdWellFormed

> **proofScopeIdWellFormed**: `string`

Defined in: [api/procedures/types.ts:969](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L969)

***

### SetAllowanceParams

Defined in: [api/procedures/types.ts:1761](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1761)

#### Properties

##### allowance

> **allowance**: `BigNumber`

Defined in: [api/procedures/types.ts:1765](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1765)

amount of POLYX to set the allowance to

##### operation

> **operation**: [`Set`](../wiki/#set)

Defined in: [api/procedures/types.ts:1766](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1766)

***

### SetAssetDocumentsParams

Defined in: [api/procedures/types.ts:1594](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1594)

#### Properties

##### documents

> **documents**: [`AssetDocument`](../wiki/api.entities.Asset.types#assetdocument)[]

Defined in: [api/procedures/types.ts:1598](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1598)

list of documents

***

### SetAssetRequirementsParams

Defined in: [api/procedures/types.ts:1491](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1491)

#### Properties

##### requirements

> **requirements**: [`InputCondition`](../wiki/api.entities.types#inputcondition)[][]

Defined in: [api/procedures/types.ts:1496](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1496)

array of array of conditions. For a transfer to be successful, it must comply with all the conditions of at least one of the arrays.
  In other words, higher level arrays are *OR* between them, while conditions inside each array are *AND* between them

***

### SetClaimCountTransferRestrictionsParams

Defined in: [api/procedures/types.ts:690](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L690)

#### Properties

##### restrictions

> **restrictions**: [`ClaimCountTransferRestrictionInput`](../wiki/#claimcounttransferrestrictioninput)[]

Defined in: [api/procedures/types.ts:691](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L691)

##### type

> **type**: [`ClaimCount`](../wiki/#claimcount)

Defined in: [api/procedures/types.ts:692](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L692)

***

### SetClaimPercentageTransferRestrictionsParams

Defined in: [api/procedures/types.ts:695](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L695)

#### Properties

##### restrictions

> **restrictions**: [`ClaimPercentageTransferRestrictionInput`](../wiki/#claimpercentagetransferrestrictioninput)[]

Defined in: [api/procedures/types.ts:696](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L696)

##### type

> **type**: [`ClaimPercentage`](../wiki/#claimpercentage)

Defined in: [api/procedures/types.ts:697](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L697)

***

### SetCountTransferRestrictionsParams

Defined in: [api/procedures/types.ts:682](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L682)

#### Properties

##### restrictions

> **restrictions**: [`CountTransferRestrictionInput`](../wiki/#counttransferrestrictioninput)[]

Defined in: [api/procedures/types.ts:686](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L686)

array of Count Transfer Restrictions with their corresponding exemptions (if applicable)

##### type

> **type**: [`Count`](../wiki/#count)

Defined in: [api/procedures/types.ts:687](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L687)

***

### SetCustodianParams

Defined in: [api/procedures/types.ts:1864](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1864)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1866](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1866)

##### targetIdentity

> **targetIdentity**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1865](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1865)

***

### SetGroupPermissionsParams

Defined in: [api/procedures/types.ts:1707](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1707)

#### Properties

##### permissions

> **permissions**: \{ `transactions`: [`TransactionPermissions`](../wiki/api.entities.types#transactionpermissions); \} \| \{ `transactionGroups`: ([`AdvancedAssetManagement`](../wiki/#advancedassetmanagement) \| [`AssetManagement`](../wiki/#assetmanagement) \| [`AssetDocumentManagement`](../wiki/#assetdocumentmanagement) \| [`AssetMetadataManagement`](../wiki/#assetmetadatamanagement) \| [`CapitalDistribution`](../wiki/#capitaldistribution) \| [`CheckpointManagement`](../wiki/#checkpointmanagement) \| [`ComplianceManagement`](../wiki/#compliancemanagement) \| [`CorporateActionsManagement`](../wiki/#corporateactionsmanagement) \| [`CorporateBallotManagement`](../wiki/#corporateballotmanagement) \| [`ExternalAgentManagement`](../wiki/#externalagentmanagement) \| [`Issuance`](../wiki/#issuance) \| [`Redemption`](../wiki/#redemption) \| [`StoManagement`](../wiki/#stomanagement) \| [`TrustedClaimIssuersManagement`](../wiki/#trustedclaimissuersmanagement))[]; \}

Defined in: [api/procedures/types.ts:1708](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1708)

***

### SetMultiSigAdminParams

Defined in: [api/procedures/types.ts:1911](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1911)

#### Properties

##### admin

> **admin**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity) \| `null`

Defined in: [api/procedures/types.ts:1915](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1915)

The identity to become an admin for the MultiSig. `null` will remove the current admin

***

### SetPermissionGroupParams

Defined in: [api/procedures/types.ts:1856](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1856)

This procedure can be called with:
  - An Asset's existing Custom Permission Group. The Identity will be assigned as an Agent of that Group for that Asset
  - A Known Permission Group and an Asset. The Identity will be assigned as an Agent of that Group for that Asset
  - A set of Transaction Permissions and an Asset. If there is no Custom Permission Group with those permissions, a Custom Permission Group will be created for that Asset with those permissions, and
    the Identity will be assigned as an Agent of that Group for that Asset. Otherwise, the existing Group will be used
  - An array of [Agent Transaction Groups](../wiki/#agenttxgroup) that represent a set of permissions. If there is no Custom Permission Group with those permissions, a Custom Permission Group will be created with those permissions, and
    the Identity will be assigned as an Agent of that Group for that Asset. Otherwise, the existing Group will be used

#### Properties

##### group

> **group**: [`CustomPermissionGroup`](../wiki/api.entities.CustomPermissionGroup#custompermissiongroup) \| [`KnownPermissionGroup`](../wiki/api.entities.KnownPermissionGroup#knownpermissiongroup) \| [`TransactionsParams`](../wiki/#transactionsparams) \| [`TxGroupParams`](../wiki/#txgroupparams)

Defined in: [api/procedures/types.ts:1857](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1857)

***

### SetStakingControllerParams

Defined in: [api/procedures/types.ts:2030](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2030)

#### Properties

##### ~~controller~~

> **controller**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:2036](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2036)

The account responsible for managing the signing stash's staking preferences

###### Deprecated

Chain v8 will ignore this argument. Instead the stash will become its own controller

***

### SetStakingPayeeParams

Defined in: [api/procedures/types.ts:2039](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2039)

#### Properties

##### autoStake

> **autoStake**: `boolean`

Defined in: [api/procedures/types.ts:2049](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2049)

If set to true then rewards will be auto staked in order to compound

###### Note

The payee must be the stash account in order to auto stake

##### payee

> **payee**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:2043](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2043)

The account who will receive the staking rewards

***

### SkipChecksOpt

Defined in: [api/procedures/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L93)

#### Properties

##### accountFrozen?

> `optional` **accountFrozen?**: `boolean`

Defined in: [api/procedures/types.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L109)

whether to skip the account frozen check

##### agentPermissions?

> `optional` **agentPermissions?**: `boolean`

Defined in: [api/procedures/types.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L105)

whether to skip the agent permissions check

##### identity?

> `optional` **identity?**: `boolean`

Defined in: [api/procedures/types.ts:113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L113)

whether to skip the identity check (i.e. whether the signing Account has an associated Identity)

##### roles?

> `optional` **roles?**: `boolean`

Defined in: [api/procedures/types.ts:97](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L97)

whether to skip the roles check

##### signerPermissions?

> `optional` **signerPermissions?**: `boolean`

Defined in: [api/procedures/types.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L101)

whether to skip the signer permissions check

***

### SubsidizeAccountParams

Defined in: [api/procedures/types.ts:781](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L781)

#### Properties

##### allowance

> **allowance**: `BigNumber`

Defined in: [api/procedures/types.ts:789](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L789)

amount of POLYX to be subsidized. This can be increased/decreased later on

##### beneficiary

> **beneficiary**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:785](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L785)

Account to subsidize

***

### TickerOwnerRole

Defined in: [api/procedures/types.ts:287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L287)

#### Properties

##### ticker

> **ticker**: `string`

Defined in: [api/procedures/types.ts:289](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L289)

##### type

> **type**: [`TickerOwner`](../wiki/#tickerowner)

Defined in: [api/procedures/types.ts:288](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L288)

***

### TransactionsParams

Defined in: [api/procedures/types.ts:1836](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1836)

#### Extends

- [`AssetBase`](../wiki/#assetbase)

#### Properties

##### asset

> **asset**: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/procedures/types.ts:1833](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1833)

Asset over which the Identity will be granted permissions

###### Inherited from

[`AssetBase`](../wiki/#assetbase).[`asset`](../wiki/#asset)

##### transactions

> **transactions**: [`TransactionPermissions`](../wiki/api.entities.types#transactionpermissions) \| `null`

Defined in: [api/procedures/types.ts:1840](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1840)

a null value means full permissions

***

### TransferAssetOwnershipParams

Defined in: [api/procedures/types.ts:1443](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1443)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1448](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1448)

date at which the authorization request for transfer expires (optional)

##### target

> **target**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1444](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1444)

***

### TransferPolyxParams

Defined in: [api/procedures/types.ts:1053](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1053)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:1061](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1061)

amount of POLYX to be transferred

##### memo?

> `optional` **memo?**: `string`

Defined in: [api/procedures/types.ts:1065](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1065)

identifier string to help differentiate transfers

##### to

> **to**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1057](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1057)

Account that will receive the POLYX

***

### TransferRestrictionClaimCountInput

Defined in: [api/procedures/types.ts:648](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L648)

#### Properties

##### claim

> **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

Defined in: [api/procedures/types.ts:652](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L652)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:651](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L651)

##### max?

> `optional` **max?**: `BigNumber`

Defined in: [api/procedures/types.ts:650](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L650)

##### min

> **min**: `BigNumber`

Defined in: [api/procedures/types.ts:649](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L649)

##### type

> **type**: [`ClaimCount`](../wiki/#claimcount)

Defined in: [api/procedures/types.ts:653](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L653)

***

### TransferRestrictionInputClaimPercentage

Defined in: [api/procedures/types.ts:655](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L655)

#### Properties

##### claim

> **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

Defined in: [api/procedures/types.ts:659](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L659)

##### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:658](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L658)

##### max

> **max**: `BigNumber`

Defined in: [api/procedures/types.ts:657](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L657)

##### min

> **min**: `BigNumber`

Defined in: [api/procedures/types.ts:656](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L656)

##### type

> **type**: [`ClaimPercentage`](../wiki/#claimpercentage)

Defined in: [api/procedures/types.ts:660](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L660)

***

### TransferRestrictionInputCount

Defined in: [api/procedures/types.ts:607](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L607)

#### Properties

##### count

> **count**: `BigNumber`

Defined in: [api/procedures/types.ts:608](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L608)

##### type

> **type**: [`Count`](../wiki/#count)

Defined in: [api/procedures/types.ts:609](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L609)

***

### TransferRestrictionInputPercentage

Defined in: [api/procedures/types.ts:643](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L643)

#### Properties

##### percentage

> **percentage**: `BigNumber`

Defined in: [api/procedures/types.ts:644](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L644)

##### type

> **type**: [`Percentage`](../wiki/#percentage)

Defined in: [api/procedures/types.ts:645](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L645)

***

### TransferTickerOwnershipParams

Defined in: [api/procedures/types.ts:1731](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1731)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1736](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1736)

date at which the authorization request for transfer expires (optional)

##### target

> **target**: `string` \| [`Identity`](../wiki/api.entities.Identity#identity)

Defined in: [api/procedures/types.ts:1732](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1732)

***

### TxData

Defined in: [api/procedures/types.ts:260](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L260)

Transaction data for display purposes

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Args` *extends* `unknown`[] | `unknown`[] |

#### Properties

##### args

> **args**: `Args`

Defined in: [api/procedures/types.ts:268](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L268)

arguments with which the transaction will be called

##### tag

> **tag**: `TxTag`

Defined in: [api/procedures/types.ts:264](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L264)

transaction string identifier

***

### TxGroupParams

Defined in: [api/procedures/types.ts:1843](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1843)

#### Extends

- [`AssetBase`](../wiki/#assetbase)

#### Properties

##### asset

> **asset**: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/procedures/types.ts:1833](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1833)

Asset over which the Identity will be granted permissions

###### Inherited from

[`AssetBase`](../wiki/#assetbase).[`asset`](../wiki/#asset)

##### transactionGroups

> **transactionGroups**: ([`AdvancedAssetManagement`](../wiki/#advancedassetmanagement) \| [`AssetManagement`](../wiki/#assetmanagement) \| [`AssetDocumentManagement`](../wiki/#assetdocumentmanagement) \| [`AssetMetadataManagement`](../wiki/#assetmetadatamanagement) \| [`CapitalDistribution`](../wiki/#capitaldistribution) \| [`CheckpointManagement`](../wiki/#checkpointmanagement) \| [`ComplianceManagement`](../wiki/#compliancemanagement) \| [`CorporateActionsManagement`](../wiki/#corporateactionsmanagement) \| [`CorporateBallotManagement`](../wiki/#corporateballotmanagement) \| [`ExternalAgentManagement`](../wiki/#externalagentmanagement) \| [`Issuance`](../wiki/#issuance) \| [`Redemption`](../wiki/#redemption) \| [`StoManagement`](../wiki/#stomanagement) \| [`TrustedClaimIssuersManagement`](../wiki/#trustedclaimissuersmanagement))[]

Defined in: [api/procedures/types.ts:1844](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1844)

***

### UnlinkChildParams

Defined in: [api/procedures/types.ts:1979](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1979)

#### Properties

##### child

> **child**: `string` \| [`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity#childidentity)

Defined in: [api/procedures/types.ts:1980](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1980)

***

### UpdatePolyxBondParams

Defined in: [api/procedures/types.ts:2052](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2052)

#### Properties

##### amount

> **amount**: `BigNumber`

Defined in: [api/procedures/types.ts:2056](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2056)

The amount of POLYX to unbond from staking

***

### UpdateVenueSignersParams

Defined in: [api/procedures/types.ts:1286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1286)

#### Properties

##### signers

> **signers**: (`string` \| [`Account`](../wiki/api.entities.Account#account))[]

Defined in: [api/procedures/types.ts:1287](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1287)

***

### VenueOwnerRole

Defined in: [api/procedures/types.ts:300](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L300)

#### Properties

##### type

> **type**: [`VenueOwner`](../wiki/#venueowner)

Defined in: [api/procedures/types.ts:301](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L301)

##### venueId

> **venueId**: `BigNumber`

Defined in: [api/procedures/types.ts:302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L302)

***

### WaivePermissionsParams

Defined in: [api/procedures/types.ts:1825](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1825)

#### Properties

##### asset

> **asset**: `string` \| [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/procedures/types.ts:1826](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1826)

## Type Aliases

### AddAssetStatParams

> **AddAssetStatParams** = `object` & [`AddCountStatParams`](../wiki/#addcountstatparams) \| [`AddBalanceStatParams`](../wiki/#addbalancestatparams) \| [`AddClaimCountStatParams`](../wiki/#addclaimcountstatparams) \| [`AddClaimBalanceStatParams`](../wiki/#addclaimbalancestatparams)

Defined in: [api/procedures/types.ts:555](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L555)

#### Type Declaration

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

***

### AddBalanceStatInput

> **AddBalanceStatInput** = `object`

Defined in: [api/procedures/types.ts:498](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L498)

#### Properties

##### balance?

> `optional` **balance?**: `BigNumber`

Defined in: [api/procedures/types.ts:505](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L505)

The total asset holder balance value for the stat

###### Note

If not provided when enabling a stat, it will default to zero.
  If not provided when updating stats, the current value will remain unchanged

***

### AddBalanceStatParams

> **AddBalanceStatParams** = [`AddBalanceStatInput`](../wiki/#addbalancestatinput) & `object`

Defined in: [api/procedures/types.ts:508](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L508)

#### Type Declaration

##### type

> **type**: [`Balance`](../wiki/api.entities.types#balance-1)

***

### AddClaimBalanceStatParams

> **AddClaimBalanceStatParams** = [`ClaimBalanceStatInput`](../wiki/#claimbalancestatinput) & `object`

Defined in: [api/procedures/types.ts:551](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L551)

#### Type Declaration

##### type

> **type**: [`ScopedBalance`](../wiki/api.entities.types#scopedbalance)

***

### AddClaimCountStatParams

> **AddClaimCountStatParams** = [`ClaimCountStatInput`](../wiki/api.entities.types#claimcountstatinput) & `object`

Defined in: [api/procedures/types.ts:512](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L512)

#### Type Declaration

##### type

> **type**: [`ScopedCount`](../wiki/api.entities.types#scopedcount)

***

### AddCountStatParams

> **AddCountStatParams** = [`AddCountStatInput`](../wiki/api.entities.types#addcountstatinput) & `object`

Defined in: [api/procedures/types.ts:494](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L494)

#### Type Declaration

##### type

> **type**: [`Count`](../wiki/api.entities.types#count-1)

***

### AddCountTransferRestrictionParams

> **AddCountTransferRestrictionParams** = [`CountTransferRestrictionInput`](../wiki/#counttransferrestrictioninput) & `object`

Defined in: [api/procedures/types.ts:672](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L672)

#### Type Declaration

##### type

> **type**: [`Count`](../wiki/#count)

***

### AddInstructionParams

> **AddInstructionParams** = `object` & \{ `endBlock?`: `BigNumber`; \} \| \{ `endAfterBlock?`: `BigNumber`; \} \| \{ `endAfterLock?`: `true`; \}

Defined in: [api/procedures/types.ts:1094](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1094)

#### Type Declaration

##### legs

> **legs**: [`InstructionLeg`](../wiki/#instructionleg)[]

array of Asset movements

##### mediators?

> `optional` **mediators?**: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]

additional identities that must affirm the instruction

###### Note

mediators are mandatory if settlement is to be locked for execution (providing `endAfterLock`)

##### memo?

> `optional` **memo?**: `string`

identifier string to help differentiate instructions

##### tradeDate?

> `optional` **tradeDate?**: `Date`

date at which the trade was agreed upon (optional, for off chain trades)

##### valueDate?

> `optional` **valueDate?**: `Date`

date at which the trade was executed (optional, for off chain trades)

***

### AddInstructionWithVenueIdParams

> **AddInstructionWithVenueIdParams** = [`AddInstructionParams`](../wiki/#addinstructionparams) & `object`

Defined in: [api/procedures/types.ts:1145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1145)

#### Type Declaration

##### venueId

> **venueId**: `BigNumber` \| `undefined`

***

### AffirmAsMediatorParams

> **AffirmAsMediatorParams** = `object`

Defined in: [api/procedures/types.ts:1245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1245)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1246](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1246)

***

### AffirmInstructionParams

> **AffirmInstructionParams** = `object`

Defined in: [api/procedures/types.ts:1229](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1229)

#### Properties

##### holders?

> `optional` **holders?**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)[]

Defined in: [api/procedures/types.ts:1235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1235)

(optional) Asset holders that the signer controls and wants to affirm the instruction

###### Note

if empty, all the legs containing any custodied portfolios or accounts of of the signer will be affirmed

##### receipts?

> `optional` **receipts?**: [`OffChainAffirmationReceipt`](../wiki/#offchainaffirmationreceipt)[]

Defined in: [api/procedures/types.ts:1242](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1242)

(optional) list of offchain receipts required for affirming offchain legs(if any) in the instruction

Receipt can be generated using [generateOffChainAffirmationReceipt](../wiki/api.entities.Instruction#generateoffchainaffirmationreceipt) method

***

### AgentTxGroup

> **AgentTxGroup** = *typeof* [`AGENT_TX_GROUP_VALUES`](../wiki/types.txGroupConstants#agent_tx_group_values)\[`number`\]

Defined in: [api/procedures/types.ts:486](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L486)

Type-level union of the `TxGroup` values that External Agents can use.

- Derived from [types/txGroupConstants!AGENT\_TX\_GROUP\_VALUES](../wiki/types.txGroupConstants#agent_tx_group_values)
- For iteration or runtime checks, prefer the [types/txGroupConstants!AGENT\_TX\_GROUP\_VALUES](../wiki/types.txGroupConstants#agent_tx_group_values) constant.
- All transactions in these groups are available to both Agents and Secondary Keys.

***

### AllowIdentityToCreatePortfoliosParams

> **AllowIdentityToCreatePortfoliosParams** = `object`

Defined in: [api/procedures/types.ts:1991](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1991)

#### Properties

##### did

> **did**: [`Identity`](../wiki/api.entities.Identity#identity) \| `string`

Defined in: [api/procedures/types.ts:1992](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1992)

***

### AssetHolderId

> **AssetHolderId** = `string` \| [`PortfolioId`](../wiki/#portfolioid-4)

Defined in: [api/procedures/types.ts:310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L310)

***

### BatchIssueNftParams

> **BatchIssueNftParams** = `object`

Defined in: [api/procedures/types.ts:1385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1385)

#### Properties

##### metadataList

> **metadataList**: [`NftMetadataInput`](../wiki/#nftmetadatainput)[][]

Defined in: [api/procedures/types.ts:1389](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1389)

List of metadata for each NFT to be issued

##### portfolioId?

> `optional` **portfolioId?**: `BigNumber`

Defined in: [api/procedures/types.ts:1393](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1393)

portfolio to which the NFTCollection will be issued (optional, default is the default portfolio)

***

### CastBallotVoteParams

> **CastBallotVoteParams** = `object`

Defined in: [api/procedures/types.ts:2113](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2113)

#### Properties

##### votes

> **votes**: [`BallotVote`](../wiki/api.entities.CorporateBallot.types#ballotvote)[][]

Defined in: [api/procedures/types.ts:2118](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2118)

The votes to be cast.

###### Note

Votes for all motion choices must be provided.

***

### ClaimBalanceStatInput

> **ClaimBalanceStatInput** = \{ `claimType`: [`Accredited`](../wiki/api.entities.types#accredited); `issuer`: [`Identity`](../wiki/api.entities.Identity#identity); `value?`: \{ `accredited`: `BigNumber`; `nonAccredited`: `BigNumber`; \}; \} \| \{ `claimType`: [`Affiliate`](../wiki/api.entities.types#affiliate); `issuer`: [`Identity`](../wiki/api.entities.Identity#identity); `value?`: \{ `affiliate`: `BigNumber`; `nonAffiliate`: `BigNumber`; \}; \} \| \{ `claimType`: [`Jurisdiction`](../wiki/api.entities.types#jurisdiction); `issuer`: [`Identity`](../wiki/api.entities.Identity#identity); `value?`: `object`[]; \}

Defined in: [api/procedures/types.ts:516](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L516)

#### Union Members

##### Type Literal

\{ `claimType`: [`Accredited`](../wiki/api.entities.types#accredited); `issuer`: [`Identity`](../wiki/api.entities.Identity#identity); `value?`: \{ `accredited`: `BigNumber`; `nonAccredited`: `BigNumber`; \}; \}

###### claimType

> **claimType**: [`Accredited`](../wiki/api.entities.types#accredited)

###### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

###### value?

> `optional` **value?**: `object`

The total balance values for token holder with the accredited and non-accredited claim

###### Note

If not provided when enabling a stat, values will default to zero.
  If not provided when updating stats, the current values will remain unchanged

###### value.accredited

> **accredited**: `BigNumber`

###### value.nonAccredited

> **nonAccredited**: `BigNumber`

***

##### Type Literal

\{ `claimType`: [`Affiliate`](../wiki/api.entities.types#affiliate); `issuer`: [`Identity`](../wiki/api.entities.Identity#identity); `value?`: \{ `affiliate`: `BigNumber`; `nonAffiliate`: `BigNumber`; \}; \}

###### claimType

> **claimType**: [`Affiliate`](../wiki/api.entities.types#affiliate)

###### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

###### value?

> `optional` **value?**: `object`

The total balance values for token holder with the affiliate and non-affiliate claim

###### Note

If not provided when enabling a stat, values will default to zero.
  If not provided when updating stats, the current values will remain unchanged

###### value.affiliate

> **affiliate**: `BigNumber`

###### value.nonAffiliate

> **nonAffiliate**: `BigNumber`

***

##### Type Literal

\{ `claimType`: [`Jurisdiction`](../wiki/api.entities.types#jurisdiction); `issuer`: [`Identity`](../wiki/api.entities.Identity#identity); `value?`: `object`[]; \}

###### claimType

> **claimType**: [`Jurisdiction`](../wiki/api.entities.types#jurisdiction)

###### issuer

> **issuer**: [`Identity`](../wiki/api.entities.Identity#identity)

###### value?

> `optional` **value?**: `object`[]

The total balance values for token holder per jurisdiction claim

###### Note

If not provided when enabling a stat, values will default to zero.
  If not provided when updating stats, the current values will remain unchanged

***

### CollectionKeyInput

> **CollectionKeyInput** = [`GlobalCollectionKeyInput`](../wiki/#globalcollectionkeyinput) \| [`LocalCollectionKeyInput`](../wiki/#localcollectionkeyinput)

Defined in: [api/procedures/types.ts:878](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L878)

Global key must be registered. local keys must provide a specification as they are created with the NftCollection

***

### CorporateBallotParams

> **CorporateBallotParams** = `Omit`\<[`CreateBallotParams`](../wiki/#createballotparams), `"declarationDate"` \| `"rcv"`\> & `object`

Defined in: [api/procedures/types.ts:2102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2102)

#### Type Declaration

##### declarationDate

> **declarationDate**: `Date`

##### rcv

> **rcv**: `boolean`

***

### GenericPolymeshTransaction

> **GenericPolymeshTransaction**\<`ProcedureReturnValue`, `ReturnValue`\> = [`PolymeshTransaction`](../wiki/base.PolymeshTransaction#polymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\> \| [`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch#polymeshtransactionbatch)\<`ProcedureReturnValue`, `ReturnValue`\>

Defined in: [api/procedures/types.ts:247](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L247)

#### Type Parameters

| Type Parameter |
| ------ |
| `ProcedureReturnValue` |
| `ReturnValue` |

***

### InitiateCorporateActionParams

> **InitiateCorporateActionParams** = `object`

Defined in: [api/procedures/types.ts:2121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2121)

#### Properties

##### checkpoint

> **checkpoint**: [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint) \| `null`

Defined in: [api/procedures/types.ts:2140](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2140)

The checkpoint of the Corporate Action (the record date on which the Corporate Action is applied)

##### declarationDate

> **declarationDate**: `Date`

Defined in: [api/procedures/types.ts:2130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2130)

The date on which the Corporate Action is declared

##### defaultTaxWithholding

> **defaultTaxWithholding**: `BigNumber` \| `null`

Defined in: [api/procedures/types.ts:2155](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2155)

The default tax withholding to be applied to the Corporate Action

##### description

> **description**: `string`

Defined in: [api/procedures/types.ts:2135](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2135)

The description of the Corporate Action

##### kind

> **kind**: [`CorporateActionKind`](../wiki/api.entities.CorporateActionBase.types#corporateactionkind)

Defined in: [api/procedures/types.ts:2125](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2125)

The kind of Corporate Action to initiate

##### targets

> **targets**: [`InputCorporateActionTargets`](../wiki/#inputcorporateactiontargets) \| `null`

Defined in: [api/procedures/types.ts:2150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2150)

The targets of the Corporate Action

##### taxWithholdings

> **taxWithholdings**: [`InputTaxWithholding`](../wiki/api.entities.CorporateActionBase.types#inputtaxwithholding)[]

Defined in: [api/procedures/types.ts:2145](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2145)

The tax withholdings to be applied to the Corporate Action

***

### InputCorporateActionTargets

> **InputCorporateActionTargets** = [`Modify`](../wiki/types.utils#modify)\<[`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types#corporateactiontargets), \{ `identities`: (`string` \| [`Identity`](../wiki/api.entities.Identity#identity))[]; \}\>

Defined in: [api/procedures/types.ts:230](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L230)

Targets of a corporate action in a flexible structure for input purposes

***

### InputCorporateActionTaxWithholdings

> **InputCorporateActionTaxWithholdings** = [`Modify`](../wiki/types.utils#modify)\<[`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types#taxwithholding), \{ `identity`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); \}\>[]

Defined in: [api/procedures/types.ts:240](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L240)

Per-Identity tax withholdings of a corporate action in a flexible structure for input purposes

***

### InstructionLeg

> **InstructionLeg** = [`InstructionFungibleLeg`](../wiki/#instructionfungibleleg) \| [`InstructionNftLeg`](../wiki/#instructionnftleg) \| [`InstructionOffChainLeg`](../wiki/#instructionoffchainleg)

Defined in: [api/procedures/types.ts:1092](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1092)

***

### InvestInOfferingParams

> **InvestInOfferingParams** = `object` & \{ `fundingPortfolio`: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike); \} \| \{ `offChainFundingReceipt`: [`OffChainFundingReceipt`](../wiki/api.entities.Offering.types#offchainfundingreceipt); `offChainTicker`: `string`; \}

Defined in: [api/procedures/types.ts:1786](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1786)

***

### IssueNftParams

> **IssueNftParams** = `object`

Defined in: [api/procedures/types.ts:1377](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1377)

#### Properties

##### metadata

> **metadata**: [`NftMetadataInput`](../wiki/#nftmetadatainput)[]

Defined in: [api/procedures/types.ts:1378](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1378)

##### portfolioId?

> `optional` **portfolioId?**: `BigNumber`

Defined in: [api/procedures/types.ts:1382](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1382)

portfolio to which the NFTCollection will be issued (optional, default is the default portfolio)

***

### ModifyAssetParams

> **ModifyAssetParams** = \{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name`: `string`; \} \| \{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible`: `true`; `name?`: `string`; \} \| \{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name?`: `string`; \} \| \{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name?`: `string`; \} \| \{ `assetType`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name?`: `string`; \}

Defined in: [api/procedures/types.ts:1331](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1331)

#### Union Members

##### Type Literal

\{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name`: `string`; \}

###### assetType?

> `optional` **assetType?**: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`

###### fundingRound?

> `optional` **fundingRound?**: `string`

###### identifiers?

> `optional` **identifiers?**: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]

###### makeDivisible?

> `optional` **makeDivisible?**: `true`

makes an indivisible Asset divisible

###### name

> **name**: `string`

***

##### Type Literal

\{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible`: `true`; `name?`: `string`; \}

***

##### Type Literal

\{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name?`: `string`; \}

***

##### Type Literal

\{ `assetType?`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name?`: `string`; \}

***

##### Type Literal

\{ `assetType`: [`KnownAssetType`](../wiki/api.entities.Asset.types#knownassettype) \| `string` \| `BigNumber`; `fundingRound?`: `string`; `identifiers?`: [`SecurityIdentifier`](../wiki/api.entities.Asset.types#securityidentifier)[]; `makeDivisible?`: `true`; `name?`: `string`; \}

***

### ModifyCaDefaultConfigParams

> **ModifyCaDefaultConfigParams** = \{ `defaultTaxWithholding`: `BigNumber`; `targets?`: [`InputTargets`](../wiki/api.entities.CorporateActionBase.types#inputtargets); `taxWithholdings?`: [`InputTaxWithholding`](../wiki/api.entities.CorporateActionBase.types#inputtaxwithholding)[]; \} \| \{ `defaultTaxWithholding?`: `BigNumber`; `targets`: [`InputTargets`](../wiki/api.entities.CorporateActionBase.types#inputtargets); `taxWithholdings?`: [`InputTaxWithholding`](../wiki/api.entities.CorporateActionBase.types#inputtaxwithholding)[]; \} \| \{ `defaultTaxWithholding?`: `BigNumber`; `targets?`: [`InputTargets`](../wiki/api.entities.CorporateActionBase.types#inputtargets); `taxWithholdings`: [`InputTaxWithholding`](../wiki/api.entities.CorporateActionBase.types#inputtaxwithholding)[]; \}

Defined in: [api/procedures/types.ts:1525](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1525)

***

### ModifyClaimsParams

> **ModifyClaimsParams** = [`AddClaimsParams`](../wiki/#addclaimsparams) \| [`EditClaimsParams`](../wiki/#editclaimsparams) \| [`RevokeClaimsParams`](../wiki/#revokeclaimsparams)

Defined in: [api/procedures/types.ts:966](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L966)

***

### ModifyComplianceRequirementParams

> **ModifyComplianceRequirementParams** = `object`

Defined in: [api/procedures/types.ts:1474](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1474)

#### Properties

##### conditions

> **conditions**: [`InputCondition`](../wiki/api.entities.types#inputcondition)[]

Defined in: [api/procedures/types.ts:1484](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1484)

array of conditions to replace the existing array of conditions for the requirement (identified by `id`).
  Conditions within a requirement are *AND* between them. This means that in order
  for a transfer to comply with this requirement, it must fulfill *ALL* conditions

##### id

> **id**: `BigNumber`

Defined in: [api/procedures/types.ts:1478](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1478)

ID of the Compliance Requirement

***

### ModifyCorporateBallotParams

> **ModifyCorporateBallotParams** = `Partial`\<`Pick`\<[`CreateBallotParams`](../wiki/#createballotparams), `"meta"` \| `"endDate"` \| `"rcv"`\>\> & `object`

Defined in: [api/procedures/types.ts:2107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2107)

#### Type Declaration

##### ballot

> **ballot**: [`CorporateBallot`](../wiki/api.entities.CorporateBallot#corporateballot) \| `BigNumber`

***

### ModifyInstructionAffirmationParams

> **ModifyInstructionAffirmationParams** = [`InstructionIdParams`](../wiki/#instructionidparams) & `object` & [`AffirmInstructionParams`](../wiki/#affirminstructionparams) \| `object` & [`WithdrawInstructionParams`](../wiki/#withdrawinstructionparams) \| `object` & [`RejectInstructionParams`](../wiki/#rejectinstructionparams) \| `object` & [`AffirmAsMediatorParams`](../wiki/#affirmasmediatorparams) \| \{ `operation`: [`WithdrawAsMediator`](../wiki/#withdrawasmediator) \| [`RejectAsMediator`](../wiki/#rejectasmediator); \}

Defined in: [api/procedures/types.ts:1249](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1249)

***

### ModifyOfferingTimesParams

> **ModifyOfferingTimesParams** = \{ `end`: `Date` \| `null`; `start?`: `Date`; \} \| \{ `end?`: `Date` \| `null`; `start`: `Date`; \} \| \{ `end`: `Date` \| `null`; `start`: `Date`; \}

Defined in: [api/procedures/types.ts:1769](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1769)

#### Union Members

##### Type Literal

\{ `end`: `Date` \| `null`; `start?`: `Date`; \}

###### end

> **end**: `Date` \| `null`

new end time (optional, will be left th same if not passed). A null value means the Offering doesn't end

###### start?

> `optional` **start?**: `Date`

new start time (optional, will be left the same if not passed)

***

##### Type Literal

\{ `end?`: `Date` \| `null`; `start`: `Date`; \}

***

##### Type Literal

\{ `end`: `Date` \| `null`; `start`: `Date`; \}

***

### ModifyVenueParams

> **ModifyVenueParams** = \{ `description?`: `string`; `type`: [`VenueType`](../wiki/api.entities.Venue.types#venuetype); \} \| \{ `description`: `string`; `type?`: [`VenueType`](../wiki/api.entities.Venue.types#venuetype); \} \| \{ `description`: `string`; `type`: [`VenueType`](../wiki/api.entities.Venue.types#venuetype); \}

Defined in: [api/procedures/types.ts:1717](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1717)

***

### MortalityProcedureOpt

> **MortalityProcedureOpt** = [`ImmortalProcedureOptValue`](../wiki/#immortalprocedureoptvalue) \| [`MortalProcedureOptValue`](../wiki/#mortalprocedureoptvalue)

Defined in: [api/procedures/types.ts:181](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L181)

***

### NftMetadataInput

> **NftMetadataInput** = `object`

Defined in: [api/procedures/types.ts:1371](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1371)

#### Properties

##### id

> **id**: `BigNumber`

Defined in: [api/procedures/types.ts:1373](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1373)

##### type

> **type**: [`MetadataType`](../wiki/api.entities.MetadataEntry.types#metadatatype)

Defined in: [api/procedures/types.ts:1372](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1372)

##### value

> **value**: `string`

Defined in: [api/procedures/types.ts:1374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1374)

***

### RegisterMetadataParams

> **RegisterMetadataParams** = \{ `name`: `string`; `specs`: [`MetadataSpec`](../wiki/api.entities.MetadataEntry.types#metadataspec); \} \| \{ `details?`: [`MetadataValueDetails`](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails); `name`: `string`; `specs`: [`MetadataSpec`](../wiki/api.entities.MetadataEntry.types#metadataspec); `value`: `string`; \}

Defined in: [api/procedures/types.ts:1922](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1922)

***

### RejectInstructionParams

> **RejectInstructionParams** = `object`

Defined in: [api/procedures/types.ts:1168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1168)

#### Properties

##### assetHolder?

> `optional` **assetHolder?**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)

Defined in: [api/procedures/types.ts:1172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1172)

(optional) Asset holder that the signer controls and wants to reject the instruction

***

### RevokeIdentityToCreatePortfoliosParams

> **RevokeIdentityToCreatePortfoliosParams** = `object`

Defined in: [api/procedures/types.ts:1995](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1995)

#### Properties

##### did

> **did**: [`Identity`](../wiki/api.entities.Identity#identity) \| `string`

Defined in: [api/procedures/types.ts:1996](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1996)

***

### Role

> **Role** = [`TickerOwnerRole`](../wiki/#tickerownerrole) \| [`CddProviderRole`](../wiki/#cddproviderrole) \| [`VenueOwnerRole`](../wiki/#venueownerrole) \| [`PortfolioCustodianRole`](../wiki/#portfoliocustodianrole) \| [`IdentityRole`](../wiki/#identityrole) \| [`DidRegistrarRole`](../wiki/#didregistrarrole)

Defined in: [api/procedures/types.ts:322](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L322)

***

### RotatePrimaryKeyToSecondaryParams

> **RotatePrimaryKeyToSecondaryParams** = `object`

Defined in: [api/procedures/types.ts:1041](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1041)

#### Properties

##### expiry?

> `optional` **expiry?**: `Date`

Defined in: [api/procedures/types.ts:1050](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1050)

(optional) when the generated authorization should expire

##### permissions

> **permissions**: [`PermissionsLike`](../wiki/api.entities.types#permissionslike)

Defined in: [api/procedures/types.ts:1042](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1042)

##### targetAccount

> **targetAccount**: `string` \| [`Account`](../wiki/api.entities.Account#account)

Defined in: [api/procedures/types.ts:1046](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1046)

The Account that should function as the primary key of the newly created Identity. Can be ss58 encoded address or an instance of Account

***

### SetMetadataParams

> **SetMetadataParams** = \{ `details?`: [`MetadataValueDetails`](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails); `value`: `string`; \} \| \{ `details`: [`MetadataValueDetails`](../wiki/api.entities.MetadataEntry.types#metadatavaluedetails); \}

Defined in: [api/procedures/types.ts:1918](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1918)

***

### SetTransferRestrictionParams

> **SetTransferRestrictionParams** = [`CountTransferRestrictionInput`](../wiki/#counttransferrestrictioninput) \| [`PercentageTransferRestrictionInput`](../wiki/#percentagetransferrestrictioninput) \| [`ClaimCountTransferRestrictionInput`](../wiki/#claimcounttransferrestrictioninput) \| [`ClaimPercentageTransferRestrictionInput`](../wiki/#claimpercentagetransferrestrictioninput)

Defined in: [api/procedures/types.ts:488](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L488)

***

### SetTransferRestrictionStatParams

> **SetTransferRestrictionStatParams** = `object`

Defined in: [api/procedures/types.ts:562](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L562)

#### Properties

##### stats

> **stats**: ([`AddCountStatParams`](../wiki/#addcountstatparams) \| [`AddBalanceStatParams`](../wiki/#addbalancestatparams) \| [`AddClaimCountStatParams`](../wiki/#addclaimcountstatparams) \| [`AddClaimBalanceStatParams`](../wiki/#addclaimbalancestatparams))[]

Defined in: [api/procedures/types.ts:563](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L563)

***

### SetVenueFilteringParams

> **SetVenueFilteringParams** = `object`

Defined in: [api/procedures/types.ts:1934](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1934)

#### Properties

##### allowedVenues?

> `optional` **allowedVenues?**: `BigNumber`[]

Defined in: [api/procedures/types.ts:1936](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1936)

##### disallowedVenues?

> `optional` **disallowedVenues?**: `BigNumber`[]

Defined in: [api/procedures/types.ts:1937](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1937)

##### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [api/procedures/types.ts:1935](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1935)

***

### TransactionArray

> **TransactionArray**\<`ReturnValues`\> = `{ [K in keyof ReturnValues]: GenericPolymeshTransaction<any, ReturnValues[K]> }`

Defined in: [api/procedures/types.ts:251](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L251)

#### Type Parameters

| Type Parameter |
| ------ |
| `ReturnValues` *extends* readonly \[`...unknown[]`\] |

***

### TransferFundsParams

> **TransferFundsParams** = [`InstructionFungibleLeg`](../wiki/#instructionfungibleleg) \| [`InstructionNftLeg`](../wiki/#instructionnftleg) & `object`

Defined in: [api/procedures/types.ts:2177](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L2177)

#### Type Declaration

##### memo?

> `optional` **memo?**: `string`

***

### TransferRestriction

> **TransferRestriction** = \{ `type`: [`Count`](../wiki/#count); `value`: `BigNumber`; \} \| \{ `type`: [`Percentage`](../wiki/#percentage); `value`: `BigNumber`; \} \| \{ `type`: [`ClaimCount`](../wiki/#claimcount); `value`: [`ClaimCountRestrictionValue`](../wiki/#claimcountrestrictionvalue); \} \| \{ `type`: [`ClaimPercentage`](../wiki/#claimpercentage); `value`: [`ClaimPercentageRestrictionValue`](../wiki/#claimpercentagerestrictionvalue); \}

Defined in: [api/procedures/types.ts:592](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L592)

***

### TransferRestrictionExemptionParams

> **TransferRestrictionExemptionParams** = `object`

Defined in: [api/procedures/types.ts:676](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L676)

#### Properties

##### claim?

> `optional` **claim?**: [`ClaimType`](../wiki/api.entities.types#claimtype)

Defined in: [api/procedures/types.ts:679](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L679)

##### identities

> **identities**: ([`Identity`](../wiki/api.entities.Identity#identity) \| `string`)[]

Defined in: [api/procedures/types.ts:678](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L678)

##### type

> **type**: [`StatType`](../wiki/api.entities.types#stattype)

Defined in: [api/procedures/types.ts:677](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L677)

***

### TransferRestrictionParams

> **TransferRestrictionParams** = `object`

Defined in: [api/procedures/types.ts:663](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L663)

#### Properties

##### restrictions

> **restrictions**: ([`TransferRestrictionInputCount`](../wiki/#transferrestrictioninputcount) \| [`TransferRestrictionInputPercentage`](../wiki/#transferrestrictioninputpercentage) \| [`TransferRestrictionClaimCountInput`](../wiki/#transferrestrictionclaimcountinput) \| [`TransferRestrictionInputClaimPercentage`](../wiki/#transferrestrictioninputclaimpercentage))[]

Defined in: [api/procedures/types.ts:664](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L664)

***

### ~~WithdrawInstructionParams~~

> **WithdrawInstructionParams** = `object`

Defined in: [api/procedures/types.ts:1178](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1178)

#### Deprecated

withdrawing affirmation is no longer supported in chain v8

#### Properties

##### ~~holders?~~

> `optional` **holders?**: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike)[]

Defined in: [api/procedures/types.ts:1184](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/procedures/types.ts#L1184)

(optional) Asset holders that the signer controls and wants to affirm the instruction or withdraw affirmation

###### Note

if empty, all the legs containing any custodied Asset Holders of the signer will be affirmed/affirmation will be withdrawn, based on the operation.
