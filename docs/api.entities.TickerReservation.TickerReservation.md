# Class: TickerReservation

[api/entities/TickerReservation](../wiki/api.entities.TickerReservation).TickerReservation

Represents a reserved Asset symbol in the Polymesh blockchain. Ticker reservations expire
  after a set length of time, after which they can be reserved by another Identity.
  A Ticker must be previously reserved by an Identity for that Identity to be able create an Asset with it

## Hierarchy

- [`Entity`](../wiki/api.entities.Entity.Entity)\<[`UniqueIdentifiers`](../wiki/api.entities.TickerReservation.UniqueIdentifiers), `string`\>

  ↳ **`TickerReservation`**

## Table of contents

### Properties

- [ticker](../wiki/api.entities.TickerReservation.TickerReservation#ticker)
- [uuid](../wiki/api.entities.TickerReservation.TickerReservation#uuid)

### Methods

- [createAsset](../wiki/api.entities.TickerReservation.TickerReservation#createasset)
- [details](../wiki/api.entities.TickerReservation.TickerReservation#details)
- [exists](../wiki/api.entities.TickerReservation.TickerReservation#exists)
- [extend](../wiki/api.entities.TickerReservation.TickerReservation#extend)
- [isEqual](../wiki/api.entities.TickerReservation.TickerReservation#isequal)
- [toHuman](../wiki/api.entities.TickerReservation.TickerReservation#tohuman)
- [transferOwnership](../wiki/api.entities.TickerReservation.TickerReservation#transferownership)
- [generateUuid](../wiki/api.entities.TickerReservation.TickerReservation#generateuuid)
- [unserialize](../wiki/api.entities.TickerReservation.TickerReservation#unserialize)

## Properties

### ticker

• **ticker**: `string`

reserved ticker

#### Defined in

[api/entities/TickerReservation/index.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L59)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Entity](../wiki/api.entities.Entity.Entity).[uuid](../wiki/api.entities.Entity.Entity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L46)

## Methods

### createAsset

▸ **createAsset**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

Create an Asset using the reserved ticker

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateAssetParams`](../wiki/api.procedures.types.CreateAssetParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

**`Note`**

required role:
  - Ticker Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [createAsset.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/TickerReservation/index.ts:226](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L226)

___

### details

▸ **details**(): `Promise`\<[`TickerReservationDetails`](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)\>

Retrieve the Reservation's owner, expiry date and status

#### Returns

`Promise`\<[`TickerReservationDetails`](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/TickerReservation/index.ts:99](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L99)

▸ **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`TickerReservationDetails`](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/TickerReservation/index.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L100)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Ticker Reservation exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[exists](../wiki/api.entities.Entity.Entity#exists)

#### Defined in

[api/entities/TickerReservation/index.ts:251](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L251)

___

### extend

▸ **extend**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation), [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)\>\>

Extend the Reservation time period of the ticker for 60 days from now
to later use it in the creation of an Asset.

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation), [`TickerReservation`](../wiki/api.entities.TickerReservation.TickerReservation)\>\>

**`Note`**

required role:
  - Ticker Owner

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [extend.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/TickerReservation/index.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L213)

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

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L61)

___

### toHuman

▸ **toHuman**(): `string`

Return the Reservation's ticker

#### Returns

`string`

#### Overrides

[Entity](../wiki/api.entities.Entity.Entity).[toHuman](../wiki/api.entities.Entity.Entity#tohuman)

#### Defined in

[api/entities/TickerReservation/index.ts:278](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L278)

___

### transferOwnership

▸ **transferOwnership**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

Transfer ownership of the Ticker Reservation to another Identity. This generates an authorization request that must be accepted
  by the target

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`TransferTickerOwnershipParams`](../wiki/api.procedures.types.TransferTickerOwnershipParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest)\>\>

**`Note`**

this will create [Authorization Request](../wiki/api.entities.AuthorizationRequest.AuthorizationRequest) which has to be accepted by the `target` Identity.
  An [Account](../wiki/api.entities.Account.Account) or [Identity](../wiki/api.entities.Identity.Identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations.Authorizations#getone)

**`Note`**

required role:
  - Ticker Owner

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [transferOwnership.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/TickerReservation/index.ts:244](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/TickerReservation/index.ts#L244)

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

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L14)

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

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Entity.ts#L23)
