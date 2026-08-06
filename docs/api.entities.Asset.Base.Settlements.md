[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Asset/Base/Settlements

# api/entities/Asset/Base/Settlements

## Classes

### FungibleSettlements

Defined in: [api/entities/Asset/Base/Settlements/index.ts:225](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L225)

Handles all Asset Settlements related functionality

#### Extends

- `BaseSettlements`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)\>

#### Methods

##### canTransfer()

> **canTransfer**(`args`): `Promise`\<[`TransferBreakdown`](../wiki/api.entities.Asset.types#transferbreakdown)\>

Defined in: [api/entities/Asset/Base/Settlements/index.ts:241](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L241)

Check whether it is possible to create a settlement instruction to transfer a certain amount of this asset between two Asset Holders. Returns a breakdown of
  the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
  failures

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `amount`: `BigNumber`; `from?`: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike); `to`: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike); \} | - |
| `args.amount` | `BigNumber` | amount of tokens to transfer |
| `args.from?` | [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike) | sender (Portfolio or Account) (optional, defaults to the signing Identity's Default Portfolio) |
| `args.to` | [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike) | receiver (Portfolio or Account) |

###### Returns

`Promise`\<[`TransferBreakdown`](../wiki/api.entities.Asset.types#transferbreakdown)\>

###### Note

this takes locked tokens into account. For example, if portfolio A has 1000 tokens and this function is called to check if 700 of them can be
  transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer those 700 tokens,
  they would become locked. From that point, further calls to this function would return failed results because of the funds being locked, even though they haven't been
  transferred yet

##### preApprove()

> **preApprove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Settlements/index.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L46)

Pre-approves receiving this asset for the signing identity. Receiving this asset in a settlement will not require manual affirmation

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [preApprove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

`BaseSettlements.preApprove`

##### removePreApproval()

> **removePreApproval**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Settlements/index.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L51)

Removes pre-approval for this asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [removePreApproval.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

`BaseSettlements.removePreApproval`

***

### NonFungibleSettlements

Defined in: [api/entities/Asset/Base/Settlements/index.ts:253](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L253)

Handles all Asset Settlements related functionality

#### Extends

- `BaseSettlements`\<[`NftCollection`](../wiki/api.entities.types#nftcollection)\>

#### Methods

##### canTransfer()

> **canTransfer**(`args`): `Promise`\<[`TransferBreakdown`](../wiki/api.entities.Asset.types#transferbreakdown)\>

Defined in: [api/entities/Asset/Base/Settlements/index.ts:269](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L269)

Check whether it is possible to create a settlement instruction to transfer an NFT between two Asset Holders. Returns a breakdown of
  the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
  failures

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `args` | \{ `from?`: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike); `nfts`: (`BigNumber` \| [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft))[]; `to`: [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike); \} | - |
| `args.from?` | [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike) | sender (Portfolio or Account) (optional, defaults to the signing Identity's Default Portfolio) |
| `args.nfts` | (`BigNumber` \| [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft))[] | the NFTs to transfer |
| `args.to` | [`AssetHolderLike`](../wiki/api.entities.types#assetholderlike) | receiver (Portfolio or Account) |

###### Returns

`Promise`\<[`TransferBreakdown`](../wiki/api.entities.Asset.types#transferbreakdown)\>

###### Note

this takes locked tokens into account. For example, if portfolio A has NFTs 1, 2 and 3 of a collection and this function is called to check if 1 of them can be
  transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer that token,
  they would become locked. From that point, further calls to this function would return failed results because of the funds being locked, even though it hasn't been
  transferred yet

##### preApprove()

> **preApprove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Settlements/index.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L46)

Pre-approves receiving this asset for the signing identity. Receiving this asset in a settlement will not require manual affirmation

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [preApprove.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

`BaseSettlements.preApprove`

##### removePreApproval()

> **removePreApproval**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Defined in: [api/entities/Asset/Base/Settlements/index.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Asset/Base/Settlements/index.ts#L51)

Removes pre-approval for this asset

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types#procedureopts) |

###### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

###### Note

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types#noargsproceduremethod), which means you can call [removePreApproval.checkAuthorization](../wiki/api.procedures.types#checkauthorization-1) on it to see whether the signing Account and Identity have the required roles and permissions to run it

###### Inherited from

`BaseSettlements.removePreApproval`
