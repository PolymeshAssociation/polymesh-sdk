# Class: Offering

[api/entities/Offering](../wiki/api.entities.Offering).Offering

Represents an Asset Offering in the Polymesh blockchain

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.Offering.UniqueIdentifiers), [`HumanReadable`](../wiki/api.entities.Offering.HumanReadable)\>

  ↳ **`Offering`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.Offering.Offering#asset)
- [id](../wiki/api.entities.Offering.Offering#id)
- [uuid](../wiki/api.entities.Offering.Offering#uuid)

### Methods

- [close](../wiki/api.entities.Offering.Offering#close)
- [details](../wiki/api.entities.Offering.Offering#details)
- [exists](../wiki/api.entities.Offering.Offering#exists)
- [freeze](../wiki/api.entities.Offering.Offering#freeze)
- [getInvestments](../wiki/api.entities.Offering.Offering#getinvestments)
- [invest](../wiki/api.entities.Offering.Offering#invest)
- [isEqual](../wiki/api.entities.Offering.Offering#isequal)
- [modifyTimes](../wiki/api.entities.Offering.Offering#modifytimes)
- [toHuman](../wiki/api.entities.Offering.Offering#tohuman)
- [unfreeze](../wiki/api.entities.Offering.Offering#unfreeze)
- [generateUuid](../wiki/api.entities.Offering.Offering#generateuuid)
- [unserialize](../wiki/api.entities.Offering.Offering#unserialize)

## Properties

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

Asset being offered

#### Defined in

[api/entities/Offering/index.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L65)

___

### id

• **id**: `BigNumber`

identifier number of the Offering

#### Defined in

[api/entities/Offering/index.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L60)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L46)

## Methods

### close

▸ **close**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Close the Offering

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [close.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Offering/index.ts:162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L162)

___

### details

▸ **details**(): `Promise`\<[`OfferingDetails`](../wiki/api.entities.Offering.types.OfferingDetails)\>

Retrieve the Offering's details

#### Returns

`Promise`\<[`OfferingDetails`](../wiki/api.entities.Offering.types.OfferingDetails)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Offering/index.ts:111](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L111)

▸ **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`OfferingDetails`](../wiki/api.entities.Offering.types.OfferingDetails)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Offering/index.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L112)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Offering exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/Offering/index.ts:273](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L273)

___

### freeze

▸ **freeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

Freeze the Offering

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [freeze.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Offering/index.ts:172](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L172)

___

### getInvestments

▸ **getInvestments**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Investment`](../wiki/api.entities.Offering.types.Investment)\>\>

Retrieve all investments made on this Offering

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `Object` | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Investment`](../wiki/api.entities.Offering.types.Investment)\>\>

**`Note`**

supports pagination

**`Note`**

uses the middleware V2

#### Defined in

[api/entities/Offering/index.ts:224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L224)

___

### invest

▸ **invest**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Invest in the Offering

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`InvestInOfferingParams`](../wiki/api.procedures.types.InvestInOfferingParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

required roles:
  - Purchase Portfolio Custodian
  - Funding Portfolio Custodian

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [invest.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Offering/index.ts:211](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L211)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)\<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[isEqual](../wiki/api.entities.Entity.Entity#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L61)

___

### modifyTimes

▸ **modifyTimes**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify the start/end time of the Offering

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`ModifyOfferingTimesParams`](../wiki/api.procedures.types#modifyofferingtimesparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if:
  - Trying to modify the start time on an Offering that already started
  - Trying to modify anything on an Offering that already ended
  - Trying to change start or end time to a past date

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modifyTimes.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Offering/index.ts:197](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L197)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.Offering.HumanReadable)

Return the Offering's ID and Asset ticker

#### Returns

[`HumanReadable`](../wiki/api.entities.Offering.HumanReadable)

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/Offering/index.ts:291](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L291)

___

### unfreeze

▸ **unfreeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

Unfreeze the Offering

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/api.entities.Offering.Offering), [`Offering`](../wiki/api.entities.Offering.Offering)\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [unfreeze.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Offering/index.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Offering/index.ts#L182)

___

### generateUuid

▸ `Static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[generateUuid](../wiki/api.entities.Entity.Entity#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L14)

___

### unserialize

▸ `Static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[unserialize](../wiki/api.entities.Entity.Entity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L23)
