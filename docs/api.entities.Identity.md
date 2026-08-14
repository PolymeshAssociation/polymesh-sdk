[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Identity

# api/entities/Identity

## Classes

### Identity

Defined in: [api/entities/Identity/index.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L103)

Represents an Identity in the Polymesh blockchain

#### Extends

- [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<[`UniqueIdentifiers`](../wiki/#uniqueidentifiers), `string`\>

#### Extended by

- [`DefaultTrustedClaimIssuer`](../wiki/api.entities.DefaultTrustedClaimIssuer#defaulttrustedclaimissuer)

#### Properties

##### assetPermissions

> **assetPermissions**: [`AssetPermissions`](../wiki/api.entities.Identity.AssetPermissions#assetpermissions)

Defined in: [api/entities/Identity/index.ts:122](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L122)

##### authorizations

> **authorizations**: [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations#identityauthorizations)

Defined in: [api/entities/Identity/index.ts:120](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L120)

##### did

> **did**: `string`

Defined in: [api/entities/Identity/index.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L117)

Identity ID as stored in the blockchain

##### portfolios

> **portfolios**: [`Portfolios`](../wiki/api.entities.Identity.Portfolios#portfolios)

Defined in: [api/entities/Identity/index.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L121)

##### uuid

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`uuid`](../wiki/api.entities.Entity#uuid)

#### Methods

##### areSecondaryAccountsFrozen()

###### Call Signature

> **areSecondaryAccountsFrozen**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:757](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L757)

Check whether secondary Accounts are frozen

###### Returns

`Promise`\<`boolean`\>

Promise that resolves to true if secondary accounts are frozen, false otherwise

###### Call Signature

> **areSecondaryAccountsFrozen**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:768](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L768)

Check whether secondary Accounts are frozen (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> | Callback function that receives frozen status updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### checkRoles()

> **checkRoles**(`roles`): `Promise`\<[`CheckRolesResult`](../wiki/api.entities.types#checkrolesresult)\>

Defined in: [api/entities/Identity/index.ts:497](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L497)

Check whether this Identity possesses all specified roles

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `roles` | [`Role`](../wiki/api.procedures.types#role)[] |

###### Returns

`Promise`\<[`CheckRolesResult`](../wiki/api.entities.types#checkrolesresult)\>

##### exists()

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:968](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L968)

Determine whether this Identity exists on chain

###### Returns

`Promise`\<`boolean`\>

###### Note

asset Identities aren't considered to exist for this check

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`exists`](../wiki/api.entities.Entity#exists)

##### getAssetBalance()

###### Call Signature

> **getAssetBalance**(`args`): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Identity/index.ts:199](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L199)

Retrieve the balance of a particular Asset by ticker

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Asset ticker |

###### Returns

`Promise`\<`BigNumber`\>

Promise that resolves to the Asset balance

###### Call Signature

> **getAssetBalance**(`args`): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Identity/index.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L208)

Retrieve the balance of a particular Asset by Asset ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; \} | - |
| `args.assetId` | `string` | Asset identifier |

###### Returns

`Promise`\<`BigNumber`\>

Promise that resolves to the Asset balance

###### Call Signature

> **getAssetBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:220](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L220)

Retrieve the balance of a particular Asset by ticker (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Asset ticker |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`BigNumber`\> | Callback function that receives balance updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Call Signature

> **getAssetBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:235](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L235)

Retrieve the balance of a particular Asset by Asset ID (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; \} | - |
| `args.assetId` | `string` | Asset identifier |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`BigNumber`\> | Callback function that receives balance updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### getHeldAssets()

> **getHeldAssets**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

Defined in: [api/entities/Identity/index.ts:394](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L394)

Retrieve a list of all Assets which were held at one point by this Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | \{ `order?`: [`AssetHoldersOrderBy`](../wiki/types#assetholdersorderby); `size?`: `BigNumber`; `start?`: `BigNumber`; \} |
| `opts.order?` | [`AssetHoldersOrderBy`](../wiki/types#assetholdersorderby) |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

###### Note

uses the middlewareV2

###### Note

supports pagination

##### getHeldNfts()

> **getHeldNfts**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HeldNfts`](../wiki/api.entities.Asset.types#heldnfts)\>\>

Defined in: [api/entities/Identity/index.ts:440](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L440)

Retrieve a list of all NftCollections which were held at one point by this Identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts` | \{ `order?`: [`NftHoldersOrderBy`](../wiki/types#nftholdersorderby); `size?`: `BigNumber`; `start?`: `BigNumber`; \} |
| `opts.order?` | [`NftHoldersOrderBy`](../wiki/types#nftholdersorderby) |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HeldNfts`](../wiki/api.entities.Asset.types#heldnfts)\>\>

###### Note

uses the middlewareV2

###### Note

supports pagination

##### getHistoricalInstructions()

> **getHistoricalInstructions**(`filter?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

Defined in: [api/entities/Identity/index.ts:1002](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1002)

Retrieve all Instructions that have been associated with this Identity's DID

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `filter?` | `Omit`\<[`HistoricalInstructionFilters`](../wiki/api.client.types#historicalinstructionfilters), `"identity"`\> |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

###### Note

uses the middleware V2

###### Note

supports pagination

##### getInstructions()

> **getInstructions**(): `Promise`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types#groupedinstructions)\>

Defined in: [api/entities/Identity/index.ts:570](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L570)

Retrieve all Instructions where this Identity is either the custodian of one or more portfolios in the legs or owns one or more accounts in the legs,
  grouped by status

###### Returns

`Promise`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types#groupedinstructions)\>

##### getInvolvedInstructions()

> **getInvolvedInstructions**(): `Promise`\<[`GroupedInvolvedInstructions`](../wiki/api.entities.Instruction.types#groupedinvolvedinstructions)\>

Defined in: [api/entities/Identity/index.ts:683](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L683)

Retrieve all Instructions where this Identity is a participant (owner/custodian),
  grouped by the role of the Identity and Instruction status

###### Returns

`Promise`\<[`GroupedInvolvedInstructions`](../wiki/api.entities.Instruction.types#groupedinvolvedinstructions)\>

##### getMultiSigSigners()

> **getMultiSigSigners**(): `Promise`\<[`MultiSigSigners`](../wiki/api.entities.Account.MultiSig.types#multisigsigners)[]\>

Defined in: [api/entities/Identity/index.ts:1125](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1125)

Returns the list of MultiSig accounts along with their signatories this identity has responsibility for.
The roles possible are:
- Admin: The identity is able to unilaterally modify the MultiSig properties, such as the signers and signatures required for a proposal
- Payer: The identity's primary key will be deducted any POLYX fees the MultiSig may incur

###### Returns

`Promise`\<[`MultiSigSigners`](../wiki/api.entities.Account.MultiSig.types#multisigsigners)[]\>

###### Note

this query can be potentially **SLOW** depending on the number of MultiSigs present on the chain

##### getOffChainAuthorizationNonce()

> **getOffChainAuthorizationNonce**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Identity/index.ts:1203](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1203)

Returns the off chain authorization nonce for this Identity

###### Returns

`Promise`\<`BigNumber`\>

##### getPendingDistributions()

> **getPendingDistributions**(): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)[]\>

Defined in: [api/entities/Identity/index.ts:806](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L806)

Retrieve every Dividend Distribution for which this Identity is eligible and hasn't been paid

###### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)[]\>

###### Note

uses the middleware

###### Note

this query can be potentially **SLOW** depending on which Assets this Identity has held

##### getPrimaryAccount()

###### Call Signature

> **getPrimaryAccount**(): `Promise`\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>

Defined in: [api/entities/Identity/index.ts:320](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L320)

Retrieve the primary Account associated with the Identity

###### Returns

`Promise`\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>

Promise that resolves to the primary Account information

###### Call Signature

> **getPrimaryAccount**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:331](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L331)

Retrieve the primary Account associated with the Identity (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\> | Callback function that receives primary Account updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

##### getSecondaryAccounts()

###### Call Signature

> **getSecondaryAccounts**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>\>

Defined in: [api/entities/Identity/index.ts:865](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L865)

Get the list of secondary Accounts related to the Identity

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) | Options for pagination |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>\>

Promise that resolves to a paginated result of secondary accounts

###### Note

supports pagination

###### Call Signature

> **getSecondaryAccounts**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:878](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L878)

Get the list of secondary Accounts related to the Identity (with subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)[]\> | Callback function that receives secondary account updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

can be subscribed to, if connected to node using a web socket

###### Call Signature

> **getSecondaryAccounts**(`paginationOpts`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:893](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L893)

Get the list of secondary Accounts related to the Identity (with pagination and subscription support)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `paginationOpts` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) | Options for pagination |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)[]\> | Callback function that receives secondary account updates |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Promise that resolves to an unsubscribe function

###### Note

supports pagination

###### Note

can be subscribed to, if connected to node using a web socket

##### getTrustingAssets()

> **getTrustingAssets**(): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)[]\>

Defined in: [api/entities/Identity/index.ts:523](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L523)

Get the list of Assets for which this Identity is a trusted claim issuer

###### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)[]\>

###### Note

uses the middlewareV2

##### getVenues()

> **getVenues**(): `Promise`\<[`Venue`](../wiki/api.entities.Venue#venue)[]\>

Defined in: [api/entities/Identity/index.ts:542](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L542)

Retrieve all Venues created by this Identity

###### Returns

`Promise`\<[`Venue`](../wiki/api.entities.Venue#venue)[]\>

##### hasRole()

> **hasRole**(`role`): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:150](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L150)

Check whether this Identity possesses the specified Role

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `role` | [`Role`](../wiki/api.procedures.types#role) |

###### Returns

`Promise`\<`boolean`\>

##### isAssetPreApproved()

> **isAssetPreApproved**(`asset`): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:1064](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1064)

Returns whether or not this Identity has pre-approved a particular asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |

###### Returns

`Promise`\<`boolean`\>

##### isDidRegistrar()

> **isDidRegistrar**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:303](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L303)

Check whether this Identity is a DID Registrar

###### Returns

`Promise`\<`boolean`\>

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

##### isGcMember()

> **isGcMember**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:286](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L286)

Check whether this Identity is Governance Committee member

###### Returns

`Promise`\<`boolean`\>

##### isMandatoryReceiverAffirmationEnabled()

> **isMandatoryReceiverAffirmationEnabled**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:1089](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1089)

Returns whether or not this Identity has opted in to mandatory receiver affirmation.
When `true`, the identity must explicitly affirm incoming asset transfer in settlements
unless an asset level or portfolio level exemption applies.

###### Returns

`Promise`\<`boolean`\>

##### preApprovedAssets()

> **preApprovedAssets**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

Defined in: [api/entities/Identity/index.ts:1030](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1030)

Returns a list of all assets this Identity has pre-approved. These assets will not require affirmation when being received in settlements

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

##### setMandatoryReceiverAffirmation()

> **setMandatoryReceiverAffirmation**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Identity/index.ts:1112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L1112)

Enable or disable mandatory receiver affirmation for incoming settlement transfers.
When enabled (`ReceiverAffirmationRequirement.Required`), the signing identity must explicitly affirm
any incoming asset transfer unless an asset level or portfolio level exemption applies.
When disabled (`ReceiverAffirmationRequirement.Automatic`), all incoming transfers are auto-affirmed.

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | \{ `requirement`: [`ReceiverAffirmationRequirement`](../wiki/api.entities.Instruction.types#receiveraffirmationrequirement); \} |
| `args.requirement` | [`ReceiverAffirmationRequirement`](../wiki/api.entities.Instruction.types#receiveraffirmationrequirement) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [setMandatoryReceiverAffirmation.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### toHuman()

> **toHuman**(): `string`

Defined in: [api/entities/Identity/index.ts:991](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L991)

Return the Identity's DID

###### Returns

`string`

###### Overrides

[`Entity`](../wiki/api.entities.Entity#abstract-entity).[`toHuman`](../wiki/api.entities.Entity#tohuman)

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

Defined in: [api/entities/Identity/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L96)

Properties that uniquely identify an Identity

#### Properties

##### did

> **did**: `string`

Defined in: [api/entities/Identity/index.ts:97](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Identity/index.ts#L97)
