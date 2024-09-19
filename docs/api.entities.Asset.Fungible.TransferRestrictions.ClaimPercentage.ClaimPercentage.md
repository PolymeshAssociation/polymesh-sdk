# Class: ClaimPercentage

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage).ClaimPercentage

Handles all Claim Percentage Transfer Restriction related functionality

## Hierarchy

- [`TransferRestrictionBase`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase)\<[`ClaimPercentage`](../wiki/api.procedures.types.TransferRestrictionType#claimpercentage)\>

  ↳ **`ClaimPercentage`**

## Table of contents

### Properties

- [addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#addrestriction)
- [disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#disablestat)
- [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#enablestat)
- [get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#get)
- [getStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#getstat)
- [removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#removerestrictions)
- [setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#setrestrictions)

## Properties

### addRestriction

• **addRestriction**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`AddClaimPercentageTransferRestrictionParams`](../wiki/api.procedures.types#addclaimpercentagetransferrestrictionparams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Add a Percentage Transfer Restriction to this Asset. This can be used to limit the total amount of supply
investors who share a ClaimType may hold. For example a restriction can be made so Canadian investors must hold
at least 50% of the supply.

**`Throws`**

if the appropriately scoped Balance statistic (by ClaimType and issuer) is not enabled for this Asset. [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage#enablestat) with appropriate arguments should be called before this method

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#addrestriction)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L32)

___

### disableStat

• **disableStat**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`RemoveScopedBalanceParams`](../wiki/api.procedures.types#removescopedbalanceparams), ``"type"``\>, `void`, `void`\>

Disables an investor balance statistic for the Asset. Since statistics introduce slight overhead to each transaction
involving the Asset, disabling unused stats will reduce gas fees for investors

**`Throws`**

if the stat is being used by a restriction or is not set

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#disablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L69)

___

### enableStat

• **enableStat**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`AddClaimPercentageStatParams`](../wiki/api.procedures.types#addclaimpercentagestatparams), ``"type"``\>, `void`, `void`\>

Enables investor balance statistic for the Asset, which is required before creating restrictions
that limit the total ownership the Asset's supply

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#enablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L61)

___

### get

• **get**: () => `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`ClaimPercentageTransferRestriction`](../wiki/api.entities.types.ClaimPercentageTransferRestriction)\>\>

#### Type declaration

▸ (): `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`ClaimPercentageTransferRestriction`](../wiki/api.entities.types.ClaimPercentageTransferRestriction)\>\>

Retrieve all active Claim Percentage Transfer Restrictions

##### Returns

`Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`ClaimPercentageTransferRestriction`](../wiki/api.entities.types.ClaimPercentageTransferRestriction)\>\>

**`Note`**

there is a maximum number of restrictions allowed across all types.
  The `availableSlots` property of the result represents how many more restrictions can be added
  before reaching that limit

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#get)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L78)

___

### getStat

• **getStat**: () => `Promise`\<[`ActiveStats`](../wiki/api.entities.types#activestats)\>

#### Type declaration

▸ (): `Promise`\<[`ActiveStats`](../wiki/api.entities.types#activestats)\>

Retrieve current Claim Percentage Transfer Restriction investor balance statistic for the Asset

##### Returns

`Promise`\<[`ActiveStats`](../wiki/api.entities.types#activestats)\>

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[getStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#getstat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L84)

___

### removeRestrictions

• **removeRestrictions**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`BigNumber`, `BigNumber`\>

Removes all Claim Percentage Transfer Restrictions from this Asset

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#removerestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L55)

___

### setRestrictions

• **setRestrictions**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`SetClaimPercentageTransferRestrictionsParams`](../wiki/api.procedures.types.SetClaimPercentageTransferRestrictionsParams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Sets all Claim Percentage Transfer Restrictions on this Asset

**`Note`**

this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Claim Percentage Transfer Restriction
but not passed into this call then it will be removed

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#setrestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts:45](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimPercentage.ts#L45)
