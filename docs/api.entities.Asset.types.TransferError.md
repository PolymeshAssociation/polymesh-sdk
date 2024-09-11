# Enumeration: TransferError

[api/entities/Asset/types](../wiki/api.entities.Asset.types).TransferError

Akin to TransferStatus, these are a bit more granular and specific. Every TransferError translates to
  a [TransferStatus](../wiki/api.entities.Asset.types.TransferStatus), but two or more TransferErrors can represent the same TransferStatus, and
  not all Transfer Statuses are represented by a TransferError

## Table of contents

### Enumeration Members

- [ComplianceFailure](../wiki/api.entities.Asset.types.TransferError#compliancefailure)
- [InsufficientBalance](../wiki/api.entities.Asset.types.TransferError#insufficientbalance)
- [InsufficientPortfolioBalance](../wiki/api.entities.Asset.types.TransferError#insufficientportfoliobalance)
- [InvalidGranularity](../wiki/api.entities.Asset.types.TransferError#invalidgranularity)
- [InvalidReceiverCdd](../wiki/api.entities.Asset.types.TransferError#invalidreceivercdd)
- [InvalidReceiverPortfolio](../wiki/api.entities.Asset.types.TransferError#invalidreceiverportfolio)
- [InvalidSenderCdd](../wiki/api.entities.Asset.types.TransferError#invalidsendercdd)
- [InvalidSenderPortfolio](../wiki/api.entities.Asset.types.TransferError#invalidsenderportfolio)
- [ScopeClaimMissing](../wiki/api.entities.Asset.types.TransferError#scopeclaimmissing)
- [SelfTransfer](../wiki/api.entities.Asset.types.TransferError#selftransfer)
- [TransfersFrozen](../wiki/api.entities.Asset.types.TransferError#transfersfrozen)

## Enumeration Members

### ComplianceFailure

• **ComplianceFailure** = ``"ComplianceFailure"``

translates to TransferStatus.ComplianceFailure

occurs if some compliance rule would prevent the transfer

#### Defined in

[api/entities/Asset/types.ts:347](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L347)

___

### InsufficientBalance

• **InsufficientBalance** = ``"InsufficientBalance"``

translates to TransferStatus.InsufficientBalance

occurs if the sender Identity does not have enough balance to cover the amount

#### Defined in

[api/entities/Asset/types.ts:316](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L316)

___

### InsufficientPortfolioBalance

• **InsufficientPortfolioBalance** = ``"InsufficientPortfolioBalance"``

translates to TransferStatus.PortfolioFailure

occurs if the sender Portfolio does not have enough balance to cover the amount

#### Defined in

[api/entities/Asset/types.ts:340](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L340)

___

### InvalidGranularity

• **InvalidGranularity** = ``"InvalidGranularity"``

translates to TransferStatus.InvalidGranularity

occurs if attempting to transfer decimal amounts of a non-divisible token

#### Defined in

[api/entities/Asset/types.ts:285](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L285)

___

### InvalidReceiverCdd

• **InvalidReceiverCdd** = ``"InvalidReceiverCdd"``

translates to TransferStatus.InvalidReceiverIdentity

occurs if the receiver Identity doesn't have a valid CDD claim

#### Defined in

[api/entities/Asset/types.ts:297](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L297)

___

### InvalidReceiverPortfolio

• **InvalidReceiverPortfolio** = ``"InvalidReceiverPortfolio"``

translates to TransferStatus.PortfolioFailure

occurs if the receiver Portfolio doesn't exist

#### Defined in

[api/entities/Asset/types.ts:334](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L334)

___

### InvalidSenderCdd

• **InvalidSenderCdd** = ``"InvalidSenderCdd"``

translates to TransferStatus.InvalidSenderIdentity

occurs if the receiver Identity doesn't have a valid CDD claim

#### Defined in

[api/entities/Asset/types.ts:303](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L303)

___

### InvalidSenderPortfolio

• **InvalidSenderPortfolio** = ``"InvalidSenderPortfolio"``

translates to TransferStatus.PortfolioFailure

occurs if the sender Portfolio doesn't exist

#### Defined in

[api/entities/Asset/types.ts:328](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L328)

___

### ScopeClaimMissing

• **ScopeClaimMissing** = ``"ScopeClaimMissing"``

translates to TransferStatus.ScopeClaimMissing

occurs if one of the participants doesn't have a valid Investor Uniqueness Claim for
  the Asset

#### Defined in

[api/entities/Asset/types.ts:310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L310)

___

### SelfTransfer

• **SelfTransfer** = ``"SelfTransfer"``

translates to TransferStatus.InvalidReceiverIdentity

occurs if the origin and destination Identities are the same

#### Defined in

[api/entities/Asset/types.ts:291](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L291)

___

### TransfersFrozen

• **TransfersFrozen** = ``"TransfersFrozen"``

translates to TransferStatus.TransfersHalted

occurs if the Asset's transfers are frozen

#### Defined in

[api/entities/Asset/types.ts:322](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/types.ts#L322)
