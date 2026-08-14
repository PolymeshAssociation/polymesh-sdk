[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/TickerReservation

# api/entities/TickerReservation

## Classes

### TickerReservation

Defined in: [api/entities/TickerReservation/index.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L44)

Represents a reserved Asset symbol in the Polymesh blockchain. Ticker reservations expire
  after a set length of time, after which they can be reserved by another Identity.
  A Ticker must be previously reserved by an Identity for that Identity to be able create an Asset with it

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), `string`\>

#### Properties

##### ticker

> **ticker**: `string`

Defined in: [api/entities/TickerReservation/index.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L58)

reserved ticker

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### createAsset()

> **createAsset**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

Defined in: [api/entities/TickerReservation/index.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L210)

Create an Asset using the reserved ticker

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`CreateAssetParams`](../wiki/api.procedures.types#createassetparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset), [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

###### Note

required role:
  - Ticker Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [createAsset.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### details()

###### Call Signature

> **details**(): `Promise`\<[`TickerReservationDetails`](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)\>

Defined in: [api/entities/TickerReservation/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L96)

Retrieve the Reservation's owner, expiry date and status

###### Returns

`Promise`\<[`TickerReservationDetails`](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)\>

###### Call Signature

> **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/TickerReservation/index.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L105)

Retrieve the Reservation's owner, expiry date and status

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`TickerReservationDetails`](../wiki/api.entities.TickerReservation.types#tickerreservationdetails)\> | Callback function that can be used to listen for changes to the reservation details |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

###### Note

can be subscribed to, if connected to node using a web socket

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/TickerReservation/index.ts:228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L228)

Determine whether this Ticker Reservation exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### extend()

> **extend**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/#tickerreservation), [`TickerReservation`](../wiki/#tickerreservation)\>\>

Defined in: [api/entities/TickerReservation/index.ts:202](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L202)

Extend the Reservation time period of the ticker for 60 days from now
to later use it in the creation of an Asset.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`TickerReservation`](../wiki/#tickerreservation), [`TickerReservation`](../wiki/#tickerreservation)\>\>

###### Note

required role:
  - Ticker Owner

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [extend.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/TickerReservation/index.ts:247](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L247)

Return the Reservation's ticker

###### Returns

`string`

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### transferOwnership()

> **transferOwnership**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

Defined in: [api/entities/TickerReservation/index.ts:223](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L223)

Transfer ownership of the Ticker Reservation to another Identity. This generates an authorization request that must be accepted
  by the target

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`TransferTickerOwnershipParams`](../wiki/api.procedures.types#transfertickerownershipparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest), [`AuthorizationRequest`](../wiki/api.entities.AuthorizationRequest#authorizationrequest)\>\>

###### Note

this will create [Authorization Request](../wiki/api.entities.AuthorizationRequest#authorizationrequest) which has to be accepted by the `target` Identity.
  An [Account](../wiki/api.entities.Account#account) or [Identity](../wiki/api.entities.Identity#identity) can fetch its pending Authorization Requests by calling [authorizations.getReceived](../wiki/api.entities.common.namespaces.Authorizations#getreceived).
  Also, an Account or Identity can directly fetch the details of an Authorization Request by calling [authorizations.getOne](../wiki/api.entities.common.namespaces.Authorizations#getone)

###### Note

required role:
  - Ticker Owner

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [transferOwnership.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L14)

Generate the Entity's UUID from its identifying properties

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `identifiers` | `Identifiers` | - |

###### Returns

`string`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`generateUuid`](../wiki/api.entities.Entity#generateuuid)

##### unserialize()

> `static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L23)

Unserialize a UUID into its Unique Identifiers

###### Type Parameters

| Type Parameter |
| ------ |
| `Identifiers` |

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `serialized` | `string` | UUID to unserialize |

###### Returns

`Identifiers`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`unserialize`](../wiki/api.entities.Entity#unserialize)

## Interfaces

### UniqueIdentifiers

Defined in: [api/entities/TickerReservation/index.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L35)

Properties that uniquely identify a TickerReservation

#### Properties

##### ticker

> **ticker**: `string`

Defined in: [api/entities/TickerReservation/index.ts:36](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/TickerReservation/index.ts#L36)
