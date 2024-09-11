# Class: DefaultTrustedClaimIssuer

[api/entities/DefaultTrustedClaimIssuer](../wiki/api.entities.DefaultTrustedClaimIssuer).DefaultTrustedClaimIssuer

Represents a default trusted claim issuer for a specific Asset in the Polymesh blockchain

## Hierarchy

- [`Identity`](../wiki/api.entities.Identity.Identity)

  ↳ **`DefaultTrustedClaimIssuer`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#asset)
- [assetPermissions](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#assetpermissions)
- [authorizations](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#authorizations)
- [did](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#did)
- [portfolios](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#portfolios)
- [uuid](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#uuid)

### Methods

- [addedAt](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#addedat)
- [areSecondaryAccountsFrozen](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#aresecondaryaccountsfrozen)
- [checkRoles](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#checkroles)
- [exists](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#exists)
- [getAssetBalance](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getassetbalance)
- [getChildIdentities](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getchildidentities)
- [getHeldAssets](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getheldassets)
- [getHeldNfts](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getheldnfts)
- [getHistoricalInstructions](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#gethistoricalinstructions)
- [getInstructions](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getinstructions)
- [getInvolvedInstructions](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getinvolvedinstructions)
- [getMultiSigSigners](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getmultisigsigners)
- [getPendingDistributions](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getpendingdistributions)
- [getPrimaryAccount](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getprimaryaccount)
- [getSecondaryAccounts](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getsecondaryaccounts)
- [getTrustingAssets](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#gettrustingassets)
- [getVenues](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#getvenues)
- [hasRole](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#hasrole)
- [hasValidCdd](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#hasvalidcdd)
- [isAssetPreApproved](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#isassetpreapproved)
- [isCddProvider](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#iscddprovider)
- [isChild](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#ischild)
- [isEqual](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#isequal)
- [isGcMember](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#isgcmember)
- [preApprovedAssets](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#preapprovedassets)
- [toHuman](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#tohuman)
- [trustedFor](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#trustedfor)
- [unlinkChild](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#unlinkchild)
- [generateUuid](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#generateuuid)
- [unserialize](../wiki/api.entities.DefaultTrustedClaimIssuer.DefaultTrustedClaimIssuer#unserialize)

## Properties

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

Asset for which this Identity is a Default Trusted Claim Issuer

#### Defined in

[api/entities/DefaultTrustedClaimIssuer.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/DefaultTrustedClaimIssuer.ts#L35)

___

### assetPermissions

• **assetPermissions**: [`AssetPermissions`](../wiki/api.entities.Identity.AssetPermissions.AssetPermissions)

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[assetPermissions](../wiki/api.entities.Identity.Identity#assetpermissions)

#### Defined in

[api/entities/Identity/index.ts:131](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L131)

___

### authorizations

• **authorizations**: [`IdentityAuthorizations`](../wiki/api.entities.Identity.IdentityAuthorizations.IdentityAuthorizations)

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[authorizations](../wiki/api.entities.Identity.Identity#authorizations)

#### Defined in

[api/entities/Identity/index.ts:129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L129)

___

### did

• **did**: `string`

Identity ID as stored in the blockchain

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[did](../wiki/api.entities.Identity.Identity#did)

#### Defined in

[api/entities/Identity/index.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L126)

___

### portfolios

• **portfolios**: [`Portfolios`](../wiki/api.entities.Identity.Portfolios.Portfolios)

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[portfolios](../wiki/api.entities.Identity.Identity#portfolios)

#### Defined in

[api/entities/Identity/index.ts:130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L130)

___

### uuid

• **uuid**: `string`

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[uuid](../wiki/api.entities.Identity.Identity#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L46)

## Methods

### addedAt

▸ **addedAt**(): `Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

Retrieve the identifier data (block number, date and event index) of the event that was emitted when the trusted claim issuer was added

#### Returns

`Promise`\<``null`` \| [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)\>

**`Note`**

uses the middlewareV2

**`Note`**

there is a possibility that the data is not ready by the time it is requested. In that case, `null` is returned

#### Defined in

[api/entities/DefaultTrustedClaimIssuer.ts:54](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/DefaultTrustedClaimIssuer.ts#L54)

___

### areSecondaryAccountsFrozen

▸ **areSecondaryAccountsFrozen**(): `Promise`\<`boolean`\>

Check whether secondary Accounts are frozen

#### Returns

`Promise`\<`boolean`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[areSecondaryAccountsFrozen](../wiki/api.entities.Identity.Identity#aresecondaryaccountsfrozen)

#### Defined in

[api/entities/Identity/index.ts:681](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L681)

▸ **areSecondaryAccountsFrozen**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`boolean`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[areSecondaryAccountsFrozen](../wiki/api.entities.Identity.Identity#aresecondaryaccountsfrozen)

#### Defined in

[api/entities/Identity/index.ts:682](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L682)

___

### checkRoles

▸ **checkRoles**(`roles`): `Promise`\<[`CheckRolesResult`](../wiki/api.entities.types.CheckRolesResult)\>

Check whether this Identity possesses all specified roles

#### Parameters

| Name | Type |
| :------ | :------ |
| `roles` | [`Role`](../wiki/api.procedures.types#role)[] |

#### Returns

`Promise`\<[`CheckRolesResult`](../wiki/api.entities.types.CheckRolesResult)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[checkRoles](../wiki/api.entities.Identity.Identity#checkroles)

#### Defined in

[api/entities/Identity/index.ts:466](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L466)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Identity exists on chain

#### Returns

`Promise`\<`boolean`\>

**`Note`**

asset Identities aren't considered to exist for this check

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[exists](../wiki/api.entities.Identity.Identity#exists)

#### Defined in

[api/entities/Identity/index.ts:858](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L858)

___

### getAssetBalance

▸ **getAssetBalance**(`args`): `Promise`\<`BigNumber`\>

Retrieve the balance of a particular Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |

#### Returns

`Promise`\<`BigNumber`\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getAssetBalance](../wiki/api.entities.Identity.Identity#getassetbalance)

#### Defined in

[api/entities/Identity/index.ts:207](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L207)

▸ **getAssetBalance**(`args`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.ticker` | `string` |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<`BigNumber`\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getAssetBalance](../wiki/api.entities.Identity.Identity#getassetbalance)

#### Defined in

[api/entities/Identity/index.ts:208](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L208)

___

### getChildIdentities

▸ **getChildIdentities**(): `Promise`\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)[]\>

Returns the list of all child identities

#### Returns

`Promise`\<[`ChildIdentity`](../wiki/api.entities.Identity.ChildIdentity.ChildIdentity)[]\>

**`Note`**

this query can be potentially **SLOW** depending on the number of parent Identities present on the chain

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getChildIdentities](../wiki/api.entities.Identity.Identity#getchildidentities)

#### Defined in

[api/entities/Identity/index.ts:910](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L910)

___

### getHeldAssets

▸ **getHeldAssets**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

Retrieve a list of all Assets which were held at one point by this Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.order?` | [`AssetHoldersOrderBy`](../wiki/types.AssetHoldersOrderBy) |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>\>

**`Note`**

uses the middlewareV2

**`Note`**

supports pagination

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getHeldAssets](../wiki/api.entities.Identity.Identity#getheldassets)

#### Defined in

[api/entities/Identity/index.ts:374](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L374)

___

### getHeldNfts

▸ **getHeldNfts**(`opts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HeldNfts`](../wiki/api.entities.Asset.types.HeldNfts)\>\>

Retrieve a list of all NftCollections which were held at one point by this Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.order?` | [`NftHoldersOrderBy`](../wiki/types.NftHoldersOrderBy) |
| `opts.size?` | `BigNumber` |
| `opts.start?` | `BigNumber` |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`HeldNfts`](../wiki/api.entities.Asset.types.HeldNfts)\>\>

**`Note`**

uses the middlewareV2

**`Note`**

supports pagination

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getHeldNfts](../wiki/api.entities.Identity.Identity#getheldnfts)

#### Defined in

[api/entities/Identity/index.ts:419](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L419)

___

### getHistoricalInstructions

▸ **getHistoricalInstructions**(): `Promise`\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)[]\>

Retrieve all Instructions that have been associated with this Identity's DID

#### Returns

`Promise`\<[`HistoricInstruction`](../wiki/api.entities.Venue.types#historicinstruction)[]\>

**`Note`**

uses the middleware V2

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getHistoricalInstructions](../wiki/api.entities.Identity.Identity#gethistoricalinstructions)

#### Defined in

[api/entities/Identity/index.ts:890](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L890)

___

### getInstructions

▸ **getInstructions**(): `Promise`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions)\>

Retrieve all Instructions where this Identity is a custodian of one or more portfolios in the legs,
  grouped by status

#### Returns

`Promise`\<[`GroupedInstructions`](../wiki/api.entities.Instruction.types.GroupedInstructions)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getInstructions](../wiki/api.entities.Identity.Identity#getinstructions)

#### Defined in

[api/entities/Identity/index.ts:535](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L535)

___

### getInvolvedInstructions

▸ **getInvolvedInstructions**(): `Promise`\<[`GroupedInvolvedInstructions`](../wiki/api.entities.Instruction.types.GroupedInvolvedInstructions)\>

Retrieve all Instructions where this Identity is a participant (owner/custodian),
  grouped by the role of the Identity and Instruction status

#### Returns

`Promise`\<[`GroupedInvolvedInstructions`](../wiki/api.entities.Instruction.types.GroupedInvolvedInstructions)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getInvolvedInstructions](../wiki/api.entities.Identity.Identity#getinvolvedinstructions)

#### Defined in

[api/entities/Identity/index.ts:622](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L622)

___

### getMultiSigSigners

▸ **getMultiSigSigners**(): `Promise`\<[`MultiSigSigners`](../wiki/api.entities.Account.MultiSig.types.MultiSigSigners)[]\>

Returns the list of MultiSig accounts linked with this Identity along with the signatories

#### Returns

`Promise`\<[`MultiSigSigners`](../wiki/api.entities.Account.MultiSig.types.MultiSigSigners)[]\>

**`Note`**

this query can be potentially **SLOW** depending on the number of MultiSigs present on the chain

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getMultiSigSigners](../wiki/api.entities.Identity.Identity#getmultisigsigners)

#### Defined in

[api/entities/Identity/index.ts:1025](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L1025)

___

### getPendingDistributions

▸ **getPendingDistributions**(): `Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types.DistributionWithDetails)[]\>

Retrieve every Dividend Distribution for which this Identity is eligible and hasn't been paid

#### Returns

`Promise`\<[`DistributionWithDetails`](../wiki/api.entities.types.DistributionWithDetails)[]\>

**`Note`**

uses the middleware

**`Note`**

this query can be potentially **SLOW** depending on which Assets this Identity has held

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getPendingDistributions](../wiki/api.entities.Identity.Identity#getpendingdistributions)

#### Defined in

[api/entities/Identity/index.ts:720](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L720)

___

### getPrimaryAccount

▸ **getPrimaryAccount**(): `Promise`\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)\>

Retrieve the primary Account associated with the Identity

#### Returns

`Promise`\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getPrimaryAccount](../wiki/api.entities.Identity.Identity#getprimaryaccount)

#### Defined in

[api/entities/Identity/index.ts:310](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L310)

▸ **getPrimaryAccount**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getPrimaryAccount](../wiki/api.entities.Identity.Identity#getprimaryaccount)

#### Defined in

[api/entities/Identity/index.ts:311](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L311)

___

### getSecondaryAccounts

▸ **getSecondaryAccounts**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)\>\>

Get the list of secondary Accounts related to the Identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)\>\>

**`Note`**

supports pagination

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getSecondaryAccounts](../wiki/api.entities.Identity.Identity#getsecondaryaccounts)

#### Defined in

[api/entities/Identity/index.ts:775](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L775)

▸ **getSecondaryAccounts**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)[]\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getSecondaryAccounts](../wiki/api.entities.Identity.Identity#getsecondaryaccounts)

#### Defined in

[api/entities/Identity/index.ts:779](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L779)

▸ **getSecondaryAccounts**(`paginationOpts`, `callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`PermissionedAccount`](../wiki/api.entities.types.PermissionedAccount)[]\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getSecondaryAccounts](../wiki/api.entities.Identity.Identity#getsecondaryaccounts)

#### Defined in

[api/entities/Identity/index.ts:783](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L783)

___

### getTrustingAssets

▸ **getTrustingAssets**(): `Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)[]\>

Get the list of Assets for which this Identity is a trusted claim issuer

#### Returns

`Promise`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)[]\>

**`Note`**

uses the middlewareV2

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getTrustingAssets](../wiki/api.entities.Identity.Identity#gettrustingassets)

#### Defined in

[api/entities/Identity/index.ts:490](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L490)

___

### getVenues

▸ **getVenues**(): `Promise`\<[`Venue`](../wiki/api.entities.Venue.Venue)[]\>

Retrieve all Venues created by this Identity

#### Returns

`Promise`\<[`Venue`](../wiki/api.entities.Venue.Venue)[]\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[getVenues](../wiki/api.entities.Identity.Identity#getvenues)

#### Defined in

[api/entities/Identity/index.ts:507](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L507)

___

### hasRole

▸ **hasRole**(`role`): `Promise`\<`boolean`\>

Check whether this Identity possesses the specified Role

#### Parameters

| Name | Type |
| :------ | :------ |
| `role` | [`Role`](../wiki/api.procedures.types#role) |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[hasRole](../wiki/api.entities.Identity.Identity#hasrole)

#### Defined in

[api/entities/Identity/index.ts:159](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L159)

___

### hasValidCdd

▸ **hasValidCdd**(): `Promise`\<`boolean`\>

Check whether this Identity has a valid CDD claim

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[hasValidCdd](../wiki/api.entities.Identity.Identity#hasvalidcdd)

#### Defined in

[api/entities/Identity/index.ts:258](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L258)

___

### isAssetPreApproved

▸ **isAssetPreApproved**(`asset`): `Promise`\<`boolean`\>

Returns whether or not this Identity has pre-approved a particular asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `asset` | `string` \| [`BaseAsset`](../wiki/api.entities.Asset.Base.BaseAsset.BaseAsset) |

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isAssetPreApproved](../wiki/api.entities.Identity.Identity#isassetpreapproved)

#### Defined in

[api/entities/Identity/index.ts:998](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L998)

___

### isCddProvider

▸ **isCddProvider**(): `Promise`\<`boolean`\>

Check whether this Identity is a CDD provider

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isCddProvider](../wiki/api.entities.Identity.Identity#iscddprovider)

#### Defined in

[api/entities/Identity/index.ts:291](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L291)

___

### isChild

▸ **isChild**(): `Promise`\<`boolean`\>

Check whether this Identity is a child Identity

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isChild](../wiki/api.entities.Identity.Identity#ischild)

#### Defined in

[api/entities/Identity/index.ts:951](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L951)

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

[Identity](../wiki/api.entities.Identity.Identity).[isEqual](../wiki/api.entities.Identity.Identity#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L61)

___

### isGcMember

▸ **isGcMember**(): `Promise`\<`boolean`\>

Check whether this Identity is Governance Committee member

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[isGcMember](../wiki/api.entities.Identity.Identity#isgcmember)

#### Defined in

[api/entities/Identity/index.ts:274](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L274)

___

### preApprovedAssets

▸ **preApprovedAssets**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>\>

Returns a list of all assets this Identity has pre-approved. These assets will not require affirmation when being received in settlements

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`Asset`](../wiki/api.entities.Asset.types#asset)\>\>

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[preApprovedAssets](../wiki/api.entities.Identity.Identity#preapprovedassets)

#### Defined in

[api/entities/Identity/index.ts:962](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L962)

___

### toHuman

▸ **toHuman**(): `string`

Return the Identity's DID

#### Returns

`string`

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[toHuman](../wiki/api.entities.Identity.Identity#tohuman)

#### Defined in

[api/entities/Identity/index.ts:881](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L881)

___

### trustedFor

▸ **trustedFor**(): `Promise`\<``null`` \| [`ClaimType`](../wiki/api.entities.types.ClaimType)[]\>

Retrieve claim types for which this Claim Issuer is trusted. A null value means that the issuer is trusted for all claim types

#### Returns

`Promise`\<``null`` \| [`ClaimType`](../wiki/api.entities.types.ClaimType)[]\>

#### Defined in

[api/entities/DefaultTrustedClaimIssuer.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/DefaultTrustedClaimIssuer.ts#L80)

___

### unlinkChild

▸ **unlinkChild**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Unlinks a child identity

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`UnlinkChildParams`](../wiki/api.procedures.types.UnlinkChildParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if
 - the `child` is not a child of this identity
 - the transaction signer is not the primary key of the parent identity

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [unlinkChild.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[Identity](../wiki/api.entities.Identity.Identity).[unlinkChild](../wiki/api.entities.Identity.Identity#unlinkchild)

#### Defined in

[api/entities/Identity/index.ts:944](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Identity/index.ts#L944)

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

[Identity](../wiki/api.entities.Identity.Identity).[generateUuid](../wiki/api.entities.Identity.Identity#generateuuid)

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

[Identity](../wiki/api.entities.Identity.Identity).[unserialize](../wiki/api.entities.Identity.Identity#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/Entity.ts#L23)
