# Class: ChildIdentity

[api/entities/Identity/ChildIdentity](../wiki/api.entities.Identity.ChildIdentity).ChildIdentity

Represents a child identity

## Hierarchy

- [`Identity`](../wiki/api.entities.Identity.Identity)

  ↳ **`ChildIdentity`**

## Table of contents

### Properties

- [assetPermissions](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#assetpermissions)
- [authorizations](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#authorizations)
- [did](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#did)
- [portfolios](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#portfolios)
- [uuid](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#uuid)

### Methods

- [areSecondaryAccountsFrozen](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#aresecondaryaccountsfrozen)
- [checkRoles](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#checkroles)
- [exists](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#exists)
- [getAssetBalance](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getassetbalance)
- [getHeldAssets](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getheldassets)
- [getHeldNfts](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getheldnfts)
- [getHistoricalInstructions](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#gethistoricalinstructions)
- [getInstructions](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getinstructions)
- [getInvolvedInstructions](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getinvolvedinstructions)
- [getParentDid](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getparentdid)
- [getPendingDistributions](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getpendingdistributions)
- [getPrimaryAccount](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getprimaryaccount)
- [getSecondaryAccounts](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getsecondaryaccounts)
- [getTrustingAssets](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#gettrustingassets)
- [getVenues](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#getvenues)
- [hasRole](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#hasrole)
- [hasValidCdd](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#hasvalidcdd)
- [isCddProvider](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#iscddprovider)
- [isChild](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#ischild)
- [isEqual](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#isequal)
- [isGcMember](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#isgcmember)
- [toHuman](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#tohuman)
- [unlinkChild](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#unlinkchild)
- [unlinkFromParent](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#unlinkfromparent)
- [generateUuid](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#generateuuid)
- [unserialize](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity#unserialize)

## Properties

### assetPermissions

• **assetPermissions**: [`AssetPermissions`](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions)

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[assetPermissions](../wiki/api.entities.Identity.Identity#assetpermissions)

#### Defined in

[api/entities/Identity/index.ts:128](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Identity/index.ts#L128)

___

### authorizations

• **authorizations**: [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations)

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[authorizations](../wiki/api.entities.Identity.Identity#authorizations)

#### Defined in

[api/entities/Identity/index.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Identity/index.ts#L126)

___

### did

• **did**: `string`

Identity ID as stored in the blockchain

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[did](../wiki/api.entities.Identity.Identity#did)

#### Defined in

[api/entities/Identity/index.ts:123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Identity/index.ts#L123)

___

### portfolios

• **portfolios**: [`Portfolios`](../wiki/api.entities.Identity.Portfolios.Portfolios)

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[portfolios](../wiki/api.entities.Identity.Identity#portfolios)

#### Defined in

[api/entities/Identity/index.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Identity/index.ts#L127)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[uuid](../wiki/api.entities.Identity.Identity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Entity.ts#L46)

## Methods

### areSecondaryAccountsFrozen

▸ **areSecondaryAccountsFrozen**(): `Promise`<`boolean`\>

Check whether secondary Accounts are frozen

**`Note`**

 can be subscribed to

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[areSecondaryAccountsFrozen](../wiki/api.entities.Identity.Identity#aresecondaryaccountsfrozen)

▸ **areSecondaryAccountsFrozen**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<`boolean`\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[areSecondaryAccountsFrozen](../wiki/api.entities.Identity.Identity#aresecondaryaccountsfrozen)

___

### checkRoles

▸ **checkRoles**(`roles`): `Promise`<[`CheckRolesResult`](../wiki/types.CheckRolesResult)\>

Check whether this Identity possesses all specified roles

#### Parameters

| Name | Type |
| :------ | :------ |
| `roles` | [`Role`](../wiki/types#role)[] |

#### Returns

`Promise`<[`CheckRolesResult`](../wiki/types.CheckRolesResult)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[checkRoles](../wiki/api.entities.Identity.Identity#checkroles)

___

### exists

▸ **exists**(): `Promise`<`boolean`\>

Determine whether this child Identity exists

**`Note`**

 asset Identities aren't considered to exist for this check

#### Returns

`Promise`<`boolean`\>

#### Overrides

[Identity](../wiki/api.entities.Identity.Identity).[exists](../wiki/api.entities.Identity.Identity#exists)

___

### getAssetBalance

▸ **getAssetBalance**(`args`): `Promise`<`BigNumber`\>

Retrieve the balance of a particular Asset

**`Note`**

 can be subscribed to

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |

#### Returns

`Promise`<`BigNumber`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getAssetBalance](../wiki/api.entities.Identity.Identity#getassetbalance)

▸ **getAssetBalance**(`args`, `callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<`BigNumber`\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getAssetBalance](../wiki/api.entities.Identity.Identity#getassetbalance)

___

### getHeldAssets

▸ **getHeldAssets**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

Retrieve a list of all Assets which were held at one point by this Identity

**`Note`**

 uses the middlewareV2

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.order?` | [`AssetHoldersOrderBy`](../wiki/types.AssetHoldersOrderBy) |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getHeldAssets](../wiki/api.entities.Identity.Identity#getheldassets)

___

### getHeldNfts

▸ **getHeldNfts**(`opts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`HeldNfts`](../wiki/types.HeldNfts)\>\>

Retrieve a list of all NftCollections which were held at one point by this Identity

**`Note`**

 uses the middlewareV2

**`Note`**

 supports pagination

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.order?` | [`NftHoldersOrderBy`](../wiki/types.NftHoldersOrderBy) |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`HeldNfts`](../wiki/types.HeldNfts)\>\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getHeldNfts](../wiki/api.entities.Identity.Identity#getheldnfts)

___

### getHistoricalInstructions

▸ **getHistoricalInstructions**(): `Promise`<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)[]\>

Retrieve all Instructions that have been associated with this Identity's DID

**`Note`**

 uses the middleware V2

#### Returns

`Promise`<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)[]\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getHistoricalInstructions](../wiki/api.entities.Identity.Identity#gethistoricalinstructions)

___

### getInstructions

▸ **getInstructions**(): `Promise`<[`GroupedInstructions`](../wiki/types.GroupedInstructions)\>

Retrieve all Instructions where this Identity is a custodian of one or more portfolios in the legs,
  grouped by status

#### Returns

`Promise`<[`GroupedInstructions`](../wiki/types.GroupedInstructions)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getInstructions](../wiki/api.entities.Identity.Identity#getinstructions)

___

### getInvolvedInstructions

▸ **getInvolvedInstructions**(): `Promise`<[`GroupedInvolvedInstructions`](../wiki/types.GroupedInvolvedInstructions)\>

Retrieve all Instructions where this Identity is a participant (owner/custodian),
  grouped by the role of the Identity and Instruction status

#### Returns

`Promise`<[`GroupedInvolvedInstructions`](../wiki/types.GroupedInvolvedInstructions)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getInvolvedInstructions](../wiki/api.entities.Identity.Identity#getinvolvedinstructions)

___

### getParentDid

▸ **getParentDid**(): `Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

Returns the parent of this Identity (if any)

#### Returns

`Promise`<``null`` \| [`Identity`](../wiki/api.entities.Identity.Identity)\>

___

### getPendingDistributions

▸ **getPendingDistributions**(): `Promise`<[`DistributionWithDetails`](../wiki/types.DistributionWithDetails)[]\>

Retrieve every Dividend Distribution for which this Identity is eligible and hasn't been paid

**`Note`**

 uses the middleware

**`Note`**

 this query can be potentially **SLOW** depending on which Assets this Identity has held

#### Returns

`Promise`<[`DistributionWithDetails`](../wiki/types.DistributionWithDetails)[]\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getPendingDistributions](../wiki/api.entities.Identity.Identity#getpendingdistributions)

___

### getPrimaryAccount

▸ **getPrimaryAccount**(): `Promise`<[`PermissionedAccount`](../wiki/types.PermissionedAccount)\>

Retrieve the primary Account associated with the Identity

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`PermissionedAccount`](../wiki/types.PermissionedAccount)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getPrimaryAccount](../wiki/api.entities.Identity.Identity#getprimaryaccount)

▸ **getPrimaryAccount**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`PermissionedAccount`](../wiki/types.PermissionedAccount)\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getPrimaryAccount](../wiki/api.entities.Identity.Identity#getprimaryaccount)

___

### getSecondaryAccounts

▸ **getSecondaryAccounts**(`paginationOpts?`): `Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`PermissionedAccount`](../wiki/types.PermissionedAccount)\>\>

Get the list of secondary Accounts related to the Identity

**`Note`**

 supports pagination

**`Note`**

 can be subscribed to

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/types.PaginationOptions) |

#### Returns

`Promise`<[`ResultSet`](../wiki/types.ResultSet)<[`PermissionedAccount`](../wiki/types.PermissionedAccount)\>\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getSecondaryAccounts](../wiki/api.entities.Identity.Identity#getsecondaryaccounts)

▸ **getSecondaryAccounts**(`callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`PermissionedAccount`](../wiki/types.PermissionedAccount)[]\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getSecondaryAccounts](../wiki/api.entities.Identity.Identity#getsecondaryaccounts)

▸ **getSecondaryAccounts**(`paginationOpts`, `callback`): `Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts` | [`PaginationOptions`](../wiki/types.PaginationOptions) |
| `callback` | [`SubCallback`](../wiki/types#subcallback)<[`PermissionedAccount`](../wiki/types.PermissionedAccount)[]\> |

#### Returns

`Promise`<[`UnsubCallback`](../wiki/types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getSecondaryAccounts](../wiki/api.entities.Identity.Identity#getsecondaryaccounts)

___

### getTrustingAssets

▸ **getTrustingAssets**(): `Promise`<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)[]\>

Get the list of Assets for which this Identity is a trusted claim issuer

**`Note`**

 uses the middlewareV2

#### Returns

`Promise`<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)[]\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getTrustingAssets](../wiki/api.entities.Identity.Identity#gettrustingassets)

___

### getVenues

▸ **getVenues**(): `Promise`<[`Venue`](../wiki/api.entities.Venue.Venue)[]\>

Retrieve all Venues created by this Identity

**`Note`**

 can be subscribed to

#### Returns

`Promise`<[`Venue`](../wiki/api.entities.Venue.Venue)[]\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getVenues](../wiki/api.entities.Identity.Identity#getvenues)

___

### hasRole

▸ **hasRole**(`role`): `Promise`<`boolean`\>

Check whether this Identity possesses the specified Role

#### Parameters

| Name | Type |
| :------ | :------ |
| `role` | [`Role`](../wiki/types#role) |

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[hasRole](../wiki/api.entities.Identity.Identity#hasrole)

___

### hasValidCdd

▸ **hasValidCdd**(): `Promise`<`boolean`\>

Check whether this Identity has a valid CDD claim

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[hasValidCdd](../wiki/api.entities.Identity.Identity#hasvalidcdd)

___

### isCddProvider

▸ **isCddProvider**(): `Promise`<`boolean`\>

Check whether this Identity is a CDD provider

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isCddProvider](../wiki/api.entities.Identity.Identity#iscddprovider)

___

### isChild

▸ **isChild**(): `Promise`<`boolean`\>

Check whether this Identity is a child Identity

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isChild](../wiki/api.entities.Identity.Identity#ischild)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isEqual](../wiki/api.entities.Identity.Identity#isequal)

___

### isGcMember

▸ **isGcMember**(): `Promise`<`boolean`\>

Check whether this Identity is Governance Committee member

#### Returns

`Promise`<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isGcMember](../wiki/api.entities.Identity.Identity#isgcmember)

___

### toHuman

▸ **toHuman**(): `string`

Return the Identity's DID

#### Returns

`string`

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[toHuman](../wiki/api.entities.Identity.Identity#tohuman)

___

### unlinkChild

▸ **unlinkChild**(`args`, `opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Unlinks a child identity

**`Throws`**

 if
 - the `child` is not a child of this identity
 - the transaction signer is not the primary key of the parent identity

**`Note`**

 this method is of type [ProcedureMethod](../wiki/types.ProcedureMethod), which means you can call [unlinkChild.checkAuthorization](../wiki/types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`UnlinkChildParams`](../wiki/api.procedures.types.UnlinkChildParams) |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[unlinkChild](../wiki/api.entities.Identity.Identity#unlinkchild)

___

### unlinkFromParent

▸ **unlinkFromParent**(`opts?`): `Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

Unlinks this child identity from its parent

**`Throws`**

 if
 - this identity doesn't have a parent
 - the transaction signer is not the primary key of the child identity

**`Note`**

 this method is of type [NoArgsProcedureMethod](../wiki/types.NoArgsProcedureMethod), which means you can call [unlinkFromParent.checkAuthorization](../wiki/types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`GenericPolymeshTransaction`](../wiki/types#genericpolymeshtransaction)<`void`, `void`\>\>

___

### generateUuid

▸ `Static` **generateUuid**<`Identifiers`\>(`identifiers`): `string`

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

[Identity](../wiki/api.entities.Identity.Identity).[generateUuid](../wiki/api.entities.Identity.Identity#generateuuid)

___

### unserialize

▸ `Static` **unserialize**<`Identifiers`\>(`serialized`): `Identifiers`

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

[Identity](../wiki/api.entities.Identity.Identity).[unserialize](../wiki/api.entities.Identity.Identity#unserialize)
