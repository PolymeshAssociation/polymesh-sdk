# Interface: OffChainAffirmationReceipt

[api/procedures/types](../wiki/api.procedures.types).OffChainAffirmationReceipt

## Table of contents

### Properties

- [legId](../wiki/api.procedures.types.OffChainAffirmationReceipt#legid)
- [metadata](../wiki/api.procedures.types.OffChainAffirmationReceipt#metadata)
- [signature](../wiki/api.procedures.types.OffChainAffirmationReceipt#signature)
- [signer](../wiki/api.procedures.types.OffChainAffirmationReceipt#signer)
- [uid](../wiki/api.procedures.types.OffChainAffirmationReceipt#uid)

## Properties

### legId

• **legId**: `BigNumber`

Index of the off chain leg within the instruction to be affirmed

#### Defined in

[api/procedures/types.ts:1033](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1033)

___

### metadata

• `Optional` **metadata**: `string`

(optional) Metadata value that can be used to attach messages to the receipt

#### Defined in

[api/procedures/types.ts:1045](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1045)

___

### signature

• **signature**: [`OffChainSignature`](../wiki/api.procedures.types.OffChainSignature)

Signature confirming the receipt details

#### Defined in

[api/procedures/types.ts:1041](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1041)

___

### signer

• **signer**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

Signer of this receipt

#### Defined in

[api/procedures/types.ts:1037](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1037)

___

### uid

• **uid**: `BigNumber`

Unique receipt number set by the signer for their receipts

#### Defined in

[api/procedures/types.ts:1029](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/procedures/types.ts#L1029)
