[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Identity/ChildIdentity

# api/entities/Identity/ChildIdentity

## Classes

### ~~ChildIdentity~~

Defined in: [api/entities/Identity/ChildIdentity.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/ChildIdentity.ts#L13)

Represents a child identity

#### Deprecated

child identities are no longer supported in chain v8

#### Extends

- [`Identity`](../wiki/api.entities.Identity#identity)

#### Properties

##### ~~assetPermissions~~

> **assetPermissions**: [`AssetPermissions`](../wiki/api.entities.Identity.AssetPermissions#assetpermissions)

Defined in: [api/entities/Identity/index.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L127)

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`assetPermissions`](../wiki/api.entities.Identity#assetpermissions)

##### ~~authorizations~~

> **authorizations**: [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations#identityauthorizations)

Defined in: [api/entities/Identity/index.ts:125](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L125)

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`authorizations`](../wiki/api.entities.Identity#authorizations)

##### ~~did~~

> **did**: `string`

Defined in: [api/entities/Identity/index.ts:122](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L122)

Identity ID as stored in the blockchain

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`did`](../wiki/api.entities.Identity#did)

##### ~~portfolios~~

> **portfolios**: [`Portfolios`](../wiki/api.entities.Identity.Portfolios#portfolios)

Defined in: [api/entities/Identity/index.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L126)

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`portfolios`](../wiki/api.entities.Identity#portfolios)

##### ~~uuid~~

> **uuid**: `string`

Defined in: [api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Entity.ts#L46)

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`uuid`](../wiki/api.entities.Identity#uuid)

#### Methods

##### ~~areSecondaryAccountsFrozen()~~

###### Call Signature

> **areSecondaryAccountsFrozen**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:805](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L805)

Check whether secondary Accounts are frozen

###### Returns

`Promise`\<`boolean`\>

Promise that resolves to true if secondary accounts are frozen, false otherwise

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`areSecondaryAccountsFrozen`](../wiki/api.entities.Identity#aresecondaryaccountsfrozen)

###### Call Signature

> **areSecondaryAccountsFrozen**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:816](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L816)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`areSecondaryAccountsFrozen`](../wiki/api.entities.Identity#aresecondaryaccountsfrozen)

##### ~~checkRoles()~~

> **checkRoles**(`roles`): `Promise`\<[`CheckRolesResult`](../wiki/api.entities.types#checkrolesresult)\>

Defined in: [api/entities/Identity/index.ts:545](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L545)

Check whether this Identity possesses all specified roles

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `roles` | [`Role`](../wiki/api.procedures.types#role)[] |

###### Returns

`Promise`\<[`CheckRolesResult`](../wiki/api.entities.types#checkrolesresult)\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`checkRoles`](../wiki/api.entities.Identity#checkroles)

##### ~~exists()~~

> **exists**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/ChildIdentity.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/ChildIdentity.ts#L80)

Determine whether this child Identity exists

###### Returns

`Promise`\<`boolean`\>

###### Note

asset Identities aren't considered to exist for this check

###### Overrides

[`Identity`](../wiki/api.entities.Identity#identity).[`exists`](../wiki/api.entities.Identity#exists)

##### ~~getAssetBalance()~~

###### Call Signature

> **getAssetBalance**(`args`): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Identity/index.ts:215](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L215)

Retrieve the balance of a particular Asset by ticker

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `ticker`: `string`; \} | - |
| `args.ticker` | `string` | Asset ticker |

###### Returns

`Promise`\<`BigNumber`\>

Promise that resolves to the Asset balance

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getAssetBalance`](../wiki/api.entities.Identity#getassetbalance)

###### Call Signature

> **getAssetBalance**(`args`): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Identity/index.ts:224](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L224)

Retrieve the balance of a particular Asset by Asset ID

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `assetId`: `string`; \} | - |
| `args.assetId` | `string` | Asset identifier |

###### Returns

`Promise`\<`BigNumber`\>

Promise that resolves to the Asset balance

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getAssetBalance`](../wiki/api.entities.Identity#getassetbalance)

###### Call Signature

> **getAssetBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:236](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L236)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getAssetBalance`](../wiki/api.entities.Identity#getassetbalance)

###### Call Signature

> **getAssetBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:251](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L251)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getAssetBalance`](../wiki/api.entities.Identity#getassetbalance)

##### ~~getHeldAssets()~~

> **getHeldAssets**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>\>

Defined in: [api/entities/Identity/index.ts:440](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L440)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getHeldAssets`](../wiki/api.entities.Identity#getheldassets)

##### ~~getHeldNfts()~~

> **getHeldNfts**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HeldNfts`](../wiki/api.entities.Asset.types#heldnfts)\>\>

Defined in: [api/entities/Identity/index.ts:487](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L487)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getHeldNfts`](../wiki/api.entities.Identity#getheldnfts)

##### ~~getHistoricalInstructions()~~

> **getHistoricalInstructions**(`filter?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)\>\>

Defined in: [api/entities/Identity/index.ts:1050](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1050)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getHistoricalInstructions`](../wiki/api.entities.Identity#gethistoricalinstructions)

##### ~~getInstructions()~~

> **getInstructions**(): `Promise`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types#groupedinstructions)\>

Defined in: [api/entities/Identity/index.ts:618](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L618)

Retrieve all Instructions where this Identity is either the custodian of one or more portfolios in the legs or owns one or more accounts in the legs,
  grouped by status

###### Returns

`Promise`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types#groupedinstructions)\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getInstructions`](../wiki/api.entities.Identity#getinstructions)

##### ~~getInvolvedInstructions()~~

> **getInvolvedInstructions**(): `Promise`\<[`GroupedInvolvedInstructions`](../wiki/api.entities.Instruction.types#groupedinvolvedinstructions)\>

Defined in: [api/entities/Identity/index.ts:731](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L731)

Retrieve all Instructions where this Identity is a participant (owner/custodian),
  grouped by the role of the Identity and Instruction status

###### Returns

`Promise`\<[`GroupedInvolvedInstructions`](../wiki/api.entities.Instruction.types#groupedinvolvedinstructions)\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getInvolvedInstructions`](../wiki/api.entities.Identity#getinvolvedinstructions)

##### ~~getMultiSigSigners()~~

> **getMultiSigSigners**(): `Promise`\<[`MultiSigSigners`](../wiki/api.entities.Account.MultiSig.types#multisigsigners)[]\>

Defined in: [api/entities/Identity/index.ts:1232](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1232)

Returns the list of MultiSig accounts along with their signatories this identity has responsibility for.
The roles possible are:
- Admin: The identity is able to unilaterally modify the MultiSig properties, such as the signers and signatures required for a proposal
- Payer: The identity's primary key will be deducted any POLYX fees the MultiSig may incur

###### Returns

`Promise`\<[`MultiSigSigners`](../wiki/api.entities.Account.MultiSig.types#multisigsigners)[]\>

###### Note

this query can be potentially **SLOW** depending on the number of MultiSigs present on the chain

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getMultiSigSigners`](../wiki/api.entities.Identity#getmultisigsigners)

##### ~~getOffChainAuthorizationNonce()~~

> **getOffChainAuthorizationNonce**(): `Promise`\<`BigNumber`\>

Defined in: [api/entities/Identity/index.ts:1310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1310)

Returns the off chain authorization nonce for this Identity

###### Returns

`Promise`\<`BigNumber`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getOffChainAuthorizationNonce`](../wiki/api.entities.Identity#getoffchainauthorizationnonce)

##### ~~getParentDid()~~

> **getParentDid**(): `Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

Defined in: [api/entities/Identity/ChildIdentity.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/ChildIdentity.ts#L34)

Returns the parent of this Identity (if any)

###### Returns

`Promise`\<[`Identity`](../wiki/api.entities.Identity#identity) \| `null`\>

###### Deprecated

##### ~~getPendingDistributions()~~

> **getPendingDistributions**(): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)[]\>

Defined in: [api/entities/Identity/index.ts:854](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L854)

Retrieve every Dividend Distribution for which this Identity is eligible and hasn't been paid

###### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types#distributionwithdetails)[]\>

###### Note

uses the middleware

###### Note

this query can be potentially **SLOW** depending on which Assets this Identity has held

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getPendingDistributions`](../wiki/api.entities.Identity#getpendingdistributions)

##### ~~getPrimaryAccount()~~

###### Call Signature

> **getPrimaryAccount**(): `Promise`\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>

Defined in: [api/entities/Identity/index.ts:366](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L366)

Retrieve the primary Account associated with the Identity

###### Returns

`Promise`\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>

Promise that resolves to the primary Account information

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getPrimaryAccount`](../wiki/api.entities.Identity#getprimaryaccount)

###### Call Signature

> **getPrimaryAccount**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:377](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L377)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getPrimaryAccount`](../wiki/api.entities.Identity#getprimaryaccount)

##### ~~getSecondaryAccounts()~~

###### Call Signature

> **getSecondaryAccounts**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`PermissionedAccount`](../wiki/api.entities.types#permissionedaccount)\>\>

Defined in: [api/entities/Identity/index.ts:913](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L913)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getSecondaryAccounts`](../wiki/api.entities.Identity#getsecondaryaccounts)

###### Call Signature

> **getSecondaryAccounts**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:926](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L926)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getSecondaryAccounts`](../wiki/api.entities.Identity#getsecondaryaccounts)

###### Call Signature

> **getSecondaryAccounts**(`paginationOpts`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Identity/index.ts:941](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L941)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getSecondaryAccounts`](../wiki/api.entities.Identity#getsecondaryaccounts)

##### ~~getTrustingAssets()~~

> **getTrustingAssets**(): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)[]\>

Defined in: [api/entities/Identity/index.ts:571](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L571)

Get the list of Assets for which this Identity is a trusted claim issuer

###### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)[]\>

###### Note

uses the middlewareV2

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getTrustingAssets`](../wiki/api.entities.Identity#gettrustingassets)

##### ~~getVenues()~~

> **getVenues**(): `Promise`\<[`Venue`](../wiki/api.entities.Venue#venue)[]\>

Defined in: [api/entities/Identity/index.ts:590](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L590)

Retrieve all Venues created by this Identity

###### Returns

`Promise`\<[`Venue`](../wiki/api.entities.Venue#venue)[]\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`getVenues`](../wiki/api.entities.Identity#getvenues)

##### ~~hasRole()~~

> **hasRole**(`role`): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:162](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L162)

Check whether this Identity possesses the specified Role

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `role` | [`Role`](../wiki/api.procedures.types#role) |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`hasRole`](../wiki/api.entities.Identity#hasrole)

##### ~~hasValidCdd()~~

> **hasValidCdd**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:304](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L304)

Check whether this Identity has a valid CDD claim

###### Returns

`Promise`\<`boolean`\>

###### Deprecated

CDD claims are discontinued from chain v8. If invoked with a v8 chain, this returns true if DID exists

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`hasValidCdd`](../wiki/api.entities.Identity#hasvalidcdd)

##### ~~isAssetPreApproved()~~

> **isAssetPreApproved**(`asset`): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:1171](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1171)

Returns whether or not this Identity has pre-approved a particular asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset#baseasset) |

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`isAssetPreApproved`](../wiki/api.entities.Identity#isassetpreapproved)

##### ~~isCddProvider()~~

> **isCddProvider**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:343](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L343)

Check whether this Identity is a CDD provider

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`isCddProvider`](../wiki/api.entities.Identity#iscddprovider)

##### ~~isChild()~~

> **isChild**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:1126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1126)

Check whether this Identity is a child Identity

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`isChild`](../wiki/api.entities.Identity#ischild)

##### ~~isEqual()~~

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

[`Identity`](../wiki/api.entities.Identity#identity).[`isEqual`](../wiki/api.entities.Identity#isequal)

##### ~~isGcMember()~~

> **isGcMember**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L326)

Check whether this Identity is Governance Committee member

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`isGcMember`](../wiki/api.entities.Identity#isgcmember)

##### ~~isMandatoryReceiverAffirmationEnabled()~~

> **isMandatoryReceiverAffirmationEnabled**(): `Promise`\<`boolean`\>

Defined in: [api/entities/Identity/index.ts:1196](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1196)

Returns whether or not this Identity has opted in to mandatory receiver affirmation.
When `true`, the identity must explicitly affirm incoming asset transfer in settlements
unless an asset level or portfolio level exemption applies.

###### Returns

`Promise`\<`boolean`\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`isMandatoryReceiverAffirmationEnabled`](../wiki/api.entities.Identity#ismandatoryreceiveraffirmationenabled)

##### ~~preApprovedAssets()~~

> **preApprovedAssets**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

Defined in: [api/entities/Identity/index.ts:1137](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1137)

Returns a list of all assets this Identity has pre-approved. These assets will not require affirmation when being received in settlements

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types#paginationoptions) |

###### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types#resultset)\<[`Asset`](../wiki/api.entities.Asset.types#asset-3)\>\>

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`preApprovedAssets`](../wiki/api.entities.Identity#preapprovedassets)

##### ~~setMandatoryReceiverAffirmation()~~

> **setMandatoryReceiverAffirmation**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Identity/index.ts:1219](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1219)

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

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`setMandatoryReceiverAffirmation`](../wiki/api.entities.Identity#setmandatoryreceiveraffirmation)

##### ~~toHuman()~~

> **toHuman**(): `string`

Defined in: [api/entities/Identity/index.ts:1039](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1039)

Return the Identity's DID

###### Returns

`string`

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`toHuman`](../wiki/api.entities.Identity#tohuman)

##### ~~unlinkChild()~~

> **unlinkChild**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Identity/index.ts:1121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/index.ts#L1121)

Unlinks a child identity

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `args` | [`UnlinkChildParams`](../wiki/api.procedures.types#unlinkchildparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if
 - the `child` is not a child of this identity
 - the transaction signer is not the primary key of the parent identity

###### Note

this method is of type [ProcedureMethod](../wiki/api.procedures.types#proceduremethod), which means you can call [unlinkChild.checkAuthorization](../wiki/api.procedures.types#checkauthorization-3) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

[`Identity`](../wiki/api.entities.Identity#identity).[`unlinkChild`](../wiki/api.entities.Identity#unlinkchild)

##### ~~unlinkFromParent()~~

> **unlinkFromParent**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Identity/ChildIdentity.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Identity/ChildIdentity.ts#L95)

Unlinks this child identity from its parent

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Throws

if
 - this identity doesn't have a parent
 - the transaction signer is not the primary key of the child identity

###### Deprecated

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [unlinkFromParent.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

##### ~~generateUuid()~~

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

[`Identity`](../wiki/api.entities.Identity#identity).[`generateUuid`](../wiki/api.entities.Identity#generateuuid)

##### ~~unserialize()~~

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

[`Identity`](../wiki/api.entities.Identity#identity).[`unserialize`](../wiki/api.entities.Identity#unserialize)
