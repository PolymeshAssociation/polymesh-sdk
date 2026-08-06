[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Offering

# api/entities/Offering

## Classes

### Offering

Defined in: [api/entities/Offering/index.ts:65](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L65)

Represents an Asset Offering in the Polymesh blockchain

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), [`HumanReadable`](../wiki/#humanreadable)\>

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/Offering/index.ts:84](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L84)

Asset being offered

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Offering/index.ts:79](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L79)

identifier number of the Offering

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### close()

> **close**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Offering/index.ts:200](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L200)

Close the Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [close.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### details()

###### Call Signature

> **details**(): `Promise`\<[`OfferingDetails`](../wiki/api.entities.Offering.types#offeringdetails)\>

Defined in: [api/entities/Offering/index.ts:139](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L139)

Retrieve the Offering's details

###### Returns

`Promise`\<[`OfferingDetails`](../wiki/api.entities.Offering.types#offeringdetails)\>

Promise that resolves to the Offering details

###### Call Signature

> **details**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Offering/index.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L150)

Retrieve the Offering's details (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`OfferingDetails`](../wiki/api.entities.Offering.types#offeringdetails)\> | Callback function that receives offering detail updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### enableOffChainFunding()

> **enableOffChainFunding**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Offering/index.ts:220](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L220)

Enable off-chain funding for the Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`EnableOffChainFundingParams`](../wiki/api.procedures.types#enableoffchainfundingparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if:
  - Trying to enable off-chain funding on an Offering that does not exist
  - Trying to enable off-chain funding on an Offering that has already ended
  - Trying to enable off-chain funding on an Offering that is already closed

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [enableOffChainFunding.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Offering/index.ts:329](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L329)

Determine whether this Offering exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### freeze()

> **freeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/#offering), [`Offering`](../wiki/#offering)\>\>

Defined in: [api/entities/Offering/index.ts:205](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L205)

Freeze the Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/#offering), [`Offering`](../wiki/#offering)\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [freeze.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### generateOffChainFundingReceipt()

> **generateOffChainFundingReceipt**(`args`): `Promise`\<[`OffChainFundingReceipt`](../wiki/api.entities.Offering.types#offchainfundingreceipt)\>

Defined in: [api/entities/Offering/index.ts:375](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L375)

Generate an off-chain funding receipt for this offering

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `amount`: `BigNumber`; `metadata?`: `string`; `offChainTicker`: `string`; `sender`: `string` \| [`Identity`](../wiki/api.entities.Identity#identity); `signer?`: `string` \| [`Account`](../wiki/api.entities.Account#account); `signerKeyRingType?`: [`SignerKeyRingType`](../wiki/api.procedures.types#signerkeyringtype); `uid`: `BigNumber`; \} | - |
| `args.amount` | `BigNumber` | equivalent investment amount in the raising asset (calculated from the off-chain asset value based on STO tier pricing) |
| `args.metadata?` | `string` | (optional) additional metadata to be associated with the receipt |
| `args.offChainTicker` | `string` | ticker symbol of the off-chain asset being transferred (e.g., 'BTC', 'ETH') |
| `args.sender` | `string` \| [`Identity`](../wiki/api.entities.Identity#identity) | Identity or DID of the investor providing the off-chain funding |
| `args.signer?` | `string` \| [`Account`](../wiki/api.entities.Account#account) | (optional) authorized venue receipt signer to generate the cryptographic signature. Defaults to signing Account associated with the SDK |
| `args.signerKeyRingType?` | [`SignerKeyRingType`](../wiki/api.procedures.types#signerkeyringtype) | (optional) keyring type for signature generation. Defaults to 'Sr25519'. Supported types: SR25519, ED25519, ECDSA |
| `args.uid` | `BigNumber` | unique receipt ID (UID) for this off-chain funding transaction |

###### Returns

`Promise`\<[`OffChainFundingReceipt`](../wiki/api.entities.Offering.types#offchainfundingreceipt)\>

###### Note

The generated receipt contains SCALE-encoded data wrapped with `<Bytes>` tags, including:
- Receipt UID
- Fundraiser ID
- Sender's DID (investor)
- Receiver's DID (raising portfolio owner)
- Off-chain asset ticker
- Equivalent investment amount in raising asset (calculated from STO tier pricing)

###### Note

The amount must represent the exact investment cost as calculated by the STO's blended pricing mechanism

##### getInvestments()

> **getInvestments**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Investment`](../wiki/api.entities.Offering.types#investment)\>\>

Defined in: [api/entities/Offering/index.ts:250](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L250)

Retrieve all investments made on this Offering

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `opts` | \{ `size?`: `BigNumber`; `start?`: `BigNumber`; \} | - |
| `opts.size?` | `BigNumber` | page size |
| `opts.start?` | `BigNumber` | page offset |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Investment`](../wiki/api.entities.Offering.types#investment)\>\>

###### Note

supports pagination

###### Note

uses the middleware V2

##### invest()

> **invest**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Offering/index.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L239)

Invest in the Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | `object` & \{ `fundingPortfolio`: [`PortfolioLike`](../wiki/api.entities.types#portfoliolike); \} \| \{ `offChainFundingReceipt`: [`OffChainFundingReceipt`](../wiki/api.entities.Offering.types#offchainfundingreceipt); `offChainTicker`: `string`; \} |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

required roles:
  - Purchase Portfolio Custodian
  - Funding Portfolio Custodian

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [invest.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### isEqual()

> **isEqual**(`entity`): `boolean`

Defined in: [api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L61)

Determine whether this Entity is the same as another one

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, `unknown`\> |

###### Returns

`boolean`

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`isEqual`](../wiki/api.entities.Entity#isequal)

##### modifyTimes()

> **modifyTimes**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Offering/index.ts:230](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L230)

Modify the start/end time of the Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`ModifyOfferingTimesParams`](../wiki/api.procedures.types#modifyofferingtimesparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if:
  - Trying to modify the start time on an Offering that already started
  - Trying to modify anything on an Offering that already ended
  - Trying to change start or end time to a past date

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [modifyTimes.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### offChainFundingDetails()

> **offChainFundingDetails**(): `Promise`\<[`OffChainFundingDetails`](../wiki/api.entities.Offering.types#offchainfundingdetails)\>

Defined in: [api/entities/Offering/index.ts:302](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L302)

Retrieve off chain funding details

###### Returns

`Promise`\<[`OffChainFundingDetails`](../wiki/api.entities.Offering.types#offchainfundingdetails)\>

##### toHuman()

> **toHuman**(): [`HumanReadable`](../wiki/#humanreadable)

Defined in: [api/entities/Offering/index.ts:345](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L345)

Return the Offering's ID and Asset ticker

###### Returns

[`HumanReadable`](../wiki/#humanreadable)

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

##### unfreeze()

> **unfreeze**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/#offering), [`Offering`](../wiki/#offering)\>\>

Defined in: [api/entities/Offering/index.ts:210](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L210)

Unfreeze the Offering

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`Offering`](../wiki/#offering), [`Offering`](../wiki/#offering)\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unfreeze.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### generateUuid()

> `static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Defined in: [api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L14)

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

Defined in: [api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L23)

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

### HumanReadable

Defined in: [api/entities/Offering/index.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L57)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/Offering/index.ts:59](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L59)

##### id

> **id**: `string`

Defined in: [api/entities/Offering/index.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L58)

***

### UniqueIdentifiers

Defined in: [api/entities/Offering/index.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L52)

#### Properties

##### assetId

> **assetId**: `string`

Defined in: [api/entities/Offering/index.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L54)

##### id

> **id**: `BigNumber`

Defined in: [api/entities/Offering/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Offering/index.ts#L53)
