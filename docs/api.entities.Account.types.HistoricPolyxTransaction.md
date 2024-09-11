# Interface: HistoricPolyxTransaction

[api/entities/Account/types](../wiki/api.entities.Account.types).HistoricPolyxTransaction

## Hierarchy

- [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)

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

[api/entities/Account/types.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L100)

___

### blockDate

• **blockDate**: `Date`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[blockDate](../wiki/api.client.types.EventIdentifier#blockdate)

#### Defined in

[api/client/types.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L170)

___

### blockHash

• **blockHash**: `string`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[blockHash](../wiki/api.client.types.EventIdentifier#blockhash)

#### Defined in

[api/client/types.ts:169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L169)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[blockNumber](../wiki/api.client.types.EventIdentifier#blocknumber)

#### Defined in

[api/client/types.ts:168](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L168)

___

### callId

• `Optional` **callId**: [`CallIdEnum`](../wiki/types.CallIdEnum)

#### Defined in

[api/entities/Account/types.ts:108](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L108)

___

### eventId

• **eventId**: [`EventIdEnum`](../wiki/types.EventIdEnum)

#### Defined in

[api/entities/Account/types.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L110)

___

### eventIndex

• **eventIndex**: `BigNumber`

#### Inherited from

[EventIdentifier](../wiki/api.client.types.EventIdentifier).[eventIndex](../wiki/api.client.types.EventIdentifier#eventindex)

#### Defined in

[api/client/types.ts:171](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L171)

___

### extrinsicIdx

• `Optional` **extrinsicIdx**: `BigNumber`

#### Defined in

[api/entities/Account/types.ts:106](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L106)

___

### fromAccount

• `Optional` **fromAccount**: [`Account`](../wiki/api.entities.Account.Account)

Account from which the POLYX transaction has been initiated/deducted in case of a transfer.

**`Note`**

this can be null in cases where some balance are endowed/transferred from treasury

#### Defined in

[api/entities/Account/types.ts:88](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L88)

___

### fromIdentity

• `Optional` **fromIdentity**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity from which the POLYX transaction has been initiated/deducted in case of a transfer.

**`Note`**

this can be null in cases where some balance are endowed/transferred from treasury

#### Defined in

[api/entities/Account/types.ts:83](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L83)

___

### memo

• `Optional` **memo**: `string`

identifier string to help differentiate transfers

#### Defined in

[api/entities/Account/types.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L105)

___

### moduleId

• **moduleId**: [`ModuleIdEnum`](../wiki/types.ModuleIdEnum)

#### Defined in

[api/entities/Account/types.ts:109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L109)

___

### toAccount

• `Optional` **toAccount**: [`Account`](../wiki/api.entities.Account.Account)

Account in which the POLYX amount was deposited.

**`Note`**

this can be null in case when account balance was burned

#### Defined in

[api/entities/Account/types.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L98)

___

### toIdentity

• `Optional` **toIdentity**: [`Identity`](../wiki/api.entities.Identity.Identity)

Identity in which the POLYX amount was deposited.

**`Note`**

this can be null in case when account balance was burned

#### Defined in

[api/entities/Account/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L93)

___

### type

• **type**: [`BalanceTypeEnum`](../wiki/types.BalanceTypeEnum)

#### Defined in

[api/entities/Account/types.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Account/types.ts#L101)
