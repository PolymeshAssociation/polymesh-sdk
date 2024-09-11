# Class: ClaimCount

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount).ClaimCount

Handles all Claim Count Transfer Restriction related functionality

## Hierarchy

- [`TransferRestrictionBase`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase)\<[`ClaimCount`](../wiki/api.procedures.types.TransferRestrictionType#claimcount)\>

  ↳ **`ClaimCount`**

## Table of contents

### Properties

- [addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#addrestriction)
- [disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#disablestat)
- [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#enablestat)
- [get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#get)
- [removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#removerestrictions)
- [setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#setrestrictions)

## Properties

### addRestriction

• **addRestriction**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`AddClaimCountTransferRestrictionParams`](../wiki/api.procedures.types#addclaimcounttransferrestrictionparams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Add a ClaimCount Transfer Restriction to this Asset. This limits to total number of individual
investors that may hold the Asset scoped by some Claim. This can limit the number of holders that
are non accredited, or ensure all holders are of a certain nationality

**`Note`**

the result is the total amount of restrictions after the procedure has run

**`Throws`**

if the appropriate count statistic (matching ClaimType and issuer) is not enabled for the Asset. [enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount#enablestat) should be called with appropriate arguments before this method

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[addRestriction](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#addrestriction)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts#L31)

___

### disableStat

• **disableStat**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`RemoveScopedCountParams`](../wiki/api.procedures.types#removescopedcountparams), ``"type"``\>, `void`, `void`\>

Disables a claim count statistic for the Asset. Since statistics introduce slight overhead to each transaction
involving the Asset, disabling unused stats will reduce gas fees for investors

**`Throws`**

if the stat is being used by a restriction or is not set

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[disableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#disablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts#L77)

___

### enableStat

• **enableStat**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`AddClaimCountStatParams`](../wiki/api.procedures.types#addclaimcountstatparams), ``"type"``\>, `void`, `void`\>

Enables an investor count statistic for the Asset to be scoped by a claim, which is required before creating restrictions

The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
As such the initial values for the stat should be passed in.
For `Affiliate` and `Accredited` scoped stats the both the number of investors who have the Claim and who do not have the claim
should be given. For `Jurisdiction` scoped stats the amount of holders for each CountryCode need to be given.

**`Note`**

Currently there is a potential race condition if passing in counts values when the Asset is being traded.
It is recommended to call this method during the initial configuration of the Asset, before people are trading it.
Otherwise the Asset should be frozen, or the stat checked after being set to ensure the correct value is used. Future
versions of the chain may expose a new extrinsic to avoid this issue

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[enableStat](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#enablestat)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts:69](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts#L69)

___

### get

• **get**: () => `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`ClaimCountTransferRestriction`](../wiki/api.entities.types.ClaimCountTransferRestriction)\>\>

#### Type declaration

▸ (): `Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`ClaimCountTransferRestriction`](../wiki/api.entities.types.ClaimCountTransferRestriction)\>\>

Retrieve all active Claim Count Transfer Restrictions

##### Returns

`Promise`\<[`ActiveTransferRestrictions`](../wiki/api.entities.types.ActiveTransferRestrictions)\<[`ClaimCountTransferRestriction`](../wiki/api.entities.types.ClaimCountTransferRestriction)\>\>

**`Note`**

there is a maximum number of restrictions allowed across all types.
  The `availableSlots` property of the result represents how many more restrictions can be added
  before reaching that limit

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[get](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#get)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts#L86)

___

### removeRestrictions

• **removeRestrictions**: [`NoArgsProcedureMethod`](../wiki/api.procedures.types.NoArgsProcedureMethod)\<`BigNumber`, `BigNumber`\>

Removes all Claim Count Transfer Restrictions from this Asset

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[removeRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#removerestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts#L54)

___

### setRestrictions

• **setRestrictions**: [`ProcedureMethod`](../wiki/api.procedures.types.ProcedureMethod)\<`Omit`\<[`SetClaimCountTransferRestrictionsParams`](../wiki/api.procedures.types.SetClaimCountTransferRestrictionsParams), ``"type"``\>, `BigNumber`, `BigNumber`\>

Sets all Claim Count Transfer Restrictions on this Asset

**`Note`**

this method sets exempted Identities for restrictions as well. If an Identity is currently exempted from a Claim Count Transfer Restriction
but not passed into this call then it will be removed

**`Note`**

the result is the total amount of restrictions after the procedure has run

#### Overrides

[TransferRestrictionBase](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase).[setRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictionBase.TransferRestrictionBase#setrestrictions)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Asset/Fungible/TransferRestrictions/ClaimCount.ts#L44)
