# Interface: HistoricPolyxTransaction

[api/entities/Account/types](../wiki/api.entities.Account.types).HistoricPolyxTransaction

## Hierarchy

- [`EventIdentifier`](../wiki/types.EventIdentifier)

  ↳ **`HistoricPolyxTransaction`**

## Table of contents

### Properties

- [amount](../wiki/api.entities.Account.types.HistoricPolyxTransaction#amount)
- [blockDate](../wiki/api.entities.Account.types.HistoricPolyxTransaction#blockdate)
- [blockHash](../wiki/api.entities.Account.types.HistoricPolyxTransaction#blockhash)
- [blockNumber](../wiki/api.entities.Account.types.HistoricPolyxTransaction#blocknumber)
- [callId](../wiki/api.entities.Account.types.HistoricPolyxTransaction#callid)
- [eventId](../wiki/api.entities.Account.types.HistoricPolyxTransaction#eventid)
- [eventIndex](../wiki/api.entities.Account.types.HistoricPolyxTransaction#eventindex)
- [extrinsicIdx](../wiki/api.entities.Account.types.HistoricPolyxTransaction#extrinsicidx)
- [fromAccount](../wiki/api.entities.Account.types.HistoricPolyxTransaction#fromaccount)
- [fromIdentity](../wiki/api.entities.Account.types.HistoricPolyxTransaction#fromidentity)
- [memo](../wiki/api.entities.Account.types.HistoricPolyxTransaction#memo)
- [moduleId](../wiki/api.entities.Account.types.HistoricPolyxTransaction#moduleid)
- [toAccount](../wiki/api.entities.Account.types.HistoricPolyxTransaction#toaccount)
- [toIdentity](../wiki/api.entities.Account.types.HistoricPolyxTransaction#toidentity)
- [type](../wiki/api.entities.Account.types.HistoricPolyxTransaction#type)

## Properties

### amount

• **amount**: `BigNumber`

#### Defined in

[api/entities/Account/types.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L87)

___

### blockDate

• **blockDate**: `Date`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[blockDate](../wiki/types.EventIdentifier#blockdate)

#### Defined in

[types/index.ts:755](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L755)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[blockHash](../wiki/types.EventIdentifier#blockhash)

#### Defined in

[types/index.ts:754](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L754)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[blockNumber](../wiki/types.EventIdentifier#blocknumber)

#### Defined in

[types/index.ts:753](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L753)

___

### callId

• `Optional` **callId**: [`CallIdEnum`](../wiki/types.CallIdEnum)

#### Defined in

[api/entities/Account/types.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L95)

___

### eventId

• **eventId**: [`EventIdEnum`](../wiki/types.EventIdEnum)

#### Defined in

[api/entities/Account/types.ts:97](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L97)

___

### eventIndex

• **eventIndex**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/types.EventIdentifier).[eventIndex](../wiki/types.EventIdentifier#eventindex)

#### Defined in

[types/index.ts:756](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L756)

___

### extrinsicIdx

• `Optional` **extrinsicIdx**: `BigNumber`

#### Defined in

[api/entities/Account/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L93)

___

### fromAccount

• `Optional` **fromAccount**: [`Account`](../wiki/api.entities.Account.Account)

Account from which the POLYX transaction has been initiated/deducted in case of a transfer.

**`Note`**

 this can be null in cases where some balance are endowed/transferred from treasury

#### Defined in

[api/entities/Account/types.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L75)

___

### fromIdentity

• `Optional` **fromIdentity**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity from which the POLYX transaction has been initiated/deducted in case of a transfer.

**`Note`**

 this can be null in cases where some balance are endowed/transferred from treasury

#### Defined in

[api/entities/Account/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L70)

___

### memo

• `Optional` **memo**: `string`

identifier string to help differentiate transfers

#### Defined in

[api/entities/Account/types.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L92)

___

### moduleId

• **moduleId**: [`ModuleIdEnum`](../wiki/types.ModuleIdEnum)

#### Defined in

[api/entities/Account/types.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L96)

___

### toAccount

• `Optional` **toAccount**: [`Account`](../wiki/api.entities.Account.Account)

Account in which the POLYX amount was deposited.

**`Note`**

 this can be null in case when account balance was burned

#### Defined in

[api/entities/Account/types.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L85)

___

### toIdentity

• `Optional` **toIdentity**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity in which the POLYX amount was deposited.

**`Note`**

 this can be null in case when account balance was burned

#### Defined in

[api/entities/Account/types.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L80)

___

### type

• **type**: [`BalanceTypeEnum`](../wiki/types.BalanceTypeEnum)

#### Defined in

[api/entities/Account/types.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Account/types.ts#L88)
