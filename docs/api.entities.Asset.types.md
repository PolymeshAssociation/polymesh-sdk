# Module: api/entities/Asset/types

## Table of contents

### References

- [CaCheckpointType](../wiki/api.entities.Asset.types#cacheckpointtype)
- [CorporateActionDefaultConfig](../wiki/api.entities.Asset.types#corporateactiondefaultconfig)
- [InputCaCheckpoint](../wiki/api.entities.Asset.types#inputcacheckpoint)

### Interfaces

- [AgentWithGroup](../wiki/api.entities.Asset.types.AgentWithGroup)
- [AssetDetails](../wiki/api.entities.Asset.types.AssetDetails)
- [HistoricAssetTransaction](../wiki/api.entities.Asset.types.HistoricAssetTransaction)
- [IdentityBalance](../wiki/api.entities.Asset.types.IdentityBalance)
- [NftMetadata](../wiki/api.entities.Asset.types.NftMetadata)
- [TransferBreakdown](../wiki/api.entities.Asset.types.TransferBreakdown)
- [TransferRestrictionResult](../wiki/api.entities.Asset.types.TransferRestrictionResult)
- [UniqueIdentifiers](../wiki/api.entities.Asset.types.UniqueIdentifiers)

### Type Aliases

- [Asset](../wiki/api.entities.Asset.types#asset)
- [CollectionKey](../wiki/api.entities.Asset.types#collectionkey)
- [MetadataKeyId](../wiki/api.entities.Asset.types#metadatakeyid)

## References

### CaCheckpointType

Re-exports [CaCheckpointType](../wiki/api.entities.Asset.Fungible.Checkpoints.types.CaCheckpointType)

___

### CorporateActionDefaultConfig

Re-exports [CorporateActionDefaultConfig](../wiki/api.entities.Asset.Fungible.CorporateActions.types.CorporateActionDefaultConfig)

___

### InputCaCheckpoint

Re-exports [InputCaCheckpoint](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint)

## Type Aliases

### Asset

Ƭ **Asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset) \| [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection.NftCollection)

Represents a generic asset on chain. Common functionality (e.g. documents) can be interacted with directly. For type specific functionality (e.g. issue) the type can
be narrowed via `instanceof` operator, or by using a more specific getter

#### Defined in

[api/entities/Asset/types.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L26)

___

### CollectionKey

Ƭ **CollectionKey**: [`MetadataKeyId`](../wiki/api.entities.Asset.types#metadatakeyid) & [`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails)

A metadata entry for which each NFT in the collection must have an entry for

**`Note`**

 each NFT **must** have an entry for each metadata value, the entry **should** comply with the relevant spec

#### Defined in

[api/entities/Asset/types.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L127)

___

### MetadataKeyId

Ƭ **MetadataKeyId**: { `id`: `BigNumber` ; `type`: [`Global`](../wiki/api.entities.MetadataEntry.types.MetadataType#global)  } \| { `id`: `BigNumber` ; `ticker`: `string` ; `type`: [`Local`](../wiki/api.entities.MetadataEntry.types.MetadataType#local)  }

The data needed to uniquely identify a metadata specification

#### Defined in

[api/entities/Asset/types.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/entities/Asset/types.ts#L100)
