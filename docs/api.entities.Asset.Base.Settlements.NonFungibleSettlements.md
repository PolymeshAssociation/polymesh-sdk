# Class: NonFungibleSettlements

[api/entities/Asset/Base/Settlements](../wiki/api.entities.Asset.Base.Settlements).NonFungibleSettlements

Handles all Asset Settlements related functionality

## Hierarchy

- `BaseSettlements`\<[`NftCollection`](../wiki/api.entities.types#nftcollection)\>

  ↳ **`NonFungibleSettlements`**

## Table of contents

### Methods

- [canTransfer](../wiki/api.entities.Asset.Base.Settlements.NonFungibleSettlements#cantransfer)
- [preApprove](../wiki/api.entities.Asset.Base.Settlements.NonFungibleSettlements#preapprove)
- [removePreApproval](../wiki/api.entities.Asset.Base.Settlements.NonFungibleSettlements#removepreapproval)

## Methods

### canTransfer

▸ **canTransfer**(`args`): `Promise`\<[`TransferBreakdown`](../wiki/api.entities.Asset.types.TransferBreakdown)\>

Check whether it is possible to create a settlement instruction to transfer an NFT between two Portfolios. Returns a breakdown of
  the transaction containing general errors (such as insufficient balance or invalid receiver), any broken transfer restrictions, and any compliance
  failures

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | - |
| `args.from?` | [`PortfolioLike`](../wiki/api.entities.types#portfoliolike) | sender Portfolio (optional, defaults to the signing Identity's Default Portfolio) |
| `args.nfts` | (`BigNumber` \| [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft.Nft))[] | the NFTs to transfer |
| `args.to` | [`PortfolioLike`](../wiki/api.entities.types#portfoliolike) | receiver Portfolio |

#### Returns

`Promise`\<[`TransferBreakdown`](../wiki/api.entities.Asset.types.TransferBreakdown)\>

**`Note`**

this takes locked tokens into account. For example, if portfolio A has NFTs 1, 2 and 3 of a collection and this function is called to check if 1 of them can be
  transferred to portfolio B (assuming everything else checks out) the result will be success. If an instruction is created and authorized to transfer that token,
  they would become locked. From that point, further calls to this function would return failed results because of the funds being locked, even though it hasn't been
  transferred yet

#### Defined in

[api/entities/Asset/Base/Settlements/index.ts:309](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/Settlements/index.ts#L309)

___

### preApprove

▸ **preApprove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Pre-approves receiving this asset for the signing identity. Receiving this asset in a settlement will not require manual affirmation

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [preApprove.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

BaseSettlements.preApprove

#### Defined in

[api/entities/Asset/Base/Settlements/index.ts:53](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/Settlements/index.ts#L53)

___

### removePreApproval

▸ **removePreApproval**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Removes pre-approval for this asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [removePreApproval.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

BaseSettlements.removePreApproval

#### Defined in

[api/entities/Asset/Base/Settlements/index.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/Base/Settlements/index.ts#L63)
