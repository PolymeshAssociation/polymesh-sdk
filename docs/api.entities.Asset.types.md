# Module: api/entities/Asset/types

## Table of contents

### References

- [CaCheckpointType](../wiki/api.entities.Asset.types#cacheckpointtype)
- [CorporateActionDefaultConfig](../wiki/api.entities.Asset.types#corporateactiondefaultconfig)
- [InputCaCheckpoint](../wiki/api.entities.Asset.types#inputcacheckpoint)

### Enumerations

- [KnownAssetType](../wiki/api.entities.Asset.types.KnownAssetType)
- [KnownNftType](../wiki/api.entities.Asset.types.KnownNftType)
- [SecurityIdentifierType](../wiki/api.entities.Asset.types.SecurityIdentifierType)
- [TransferError](../wiki/api.entities.Asset.types.TransferError)
- [TransferStatus](../wiki/api.entities.Asset.types.TransferStatus)

### Interfaces

- [AgentWithGroup](../wiki/api.entities.Asset.types.AgentWithGroup)
- [AssetDetails](../wiki/api.entities.Asset.types.AssetDetails)
- [AssetDocument](../wiki/api.entities.Asset.types.AssetDocument)
- [AssetWithGroup](../wiki/api.entities.Asset.types.AssetWithGroup)
- [BaseHistoricAssetTransaction](../wiki/api.entities.Asset.types.BaseHistoricAssetTransaction)
- [HeldNfts](../wiki/api.entities.Asset.types.HeldNfts)
- [HistoricAgentOperation](../wiki/api.entities.Asset.types.HistoricAgentOperation)
- [HistoricAssetTransaction](../wiki/api.entities.Asset.types.HistoricAssetTransaction)
- [HistoricNftTransaction](../wiki/api.entities.Asset.types.HistoricNftTransaction)
- [IdentityBalance](../wiki/api.entities.Asset.types.IdentityBalance)
- [IdentityHeldNfts](../wiki/api.entities.Asset.types.IdentityHeldNfts)
- [NftMetadata](../wiki/api.entities.Asset.types.NftMetadata)
- [SecurityIdentifier](../wiki/api.entities.Asset.types.SecurityIdentifier)
- [TransferBreakdown](../wiki/api.entities.Asset.types.TransferBreakdown)
- [TransferRestrictionResult](../wiki/api.entities.Asset.types.TransferRestrictionResult)
- [UniqueIdentifiers](../wiki/api.entities.Asset.types.UniqueIdentifiers)
- [VenueFilteringDetails](../wiki/api.entities.Asset.types.VenueFilteringDetails)

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

[api/entities/Asset/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L27)

___

### CollectionKey

Ƭ **CollectionKey**: [`MetadataKeyId`](../wiki/api.entities.Asset.types#metadatakeyid) & [`MetadataDetails`](../wiki/api.entities.MetadataEntry.types.MetadataDetails)

A metadata entry for which each NFT in the collection must have an entry for

**`Note`**

each NFT **must** have an entry for each metadata value, the entry **should** comply with the relevant spec

#### Defined in

[api/entities/Asset/types.ts:251](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L251)

___

### MetadataKeyId

Ƭ **MetadataKeyId**: \{ `id`: `BigNumber` ; `type`: [`Global`](../wiki/api.entities.MetadataEntry.types.MetadataType#global)  } \| \{ `assetId`: `string` ; `id`: `BigNumber` ; `ticker?`: `string` ; `type`: [`Local`](../wiki/api.entities.MetadataEntry.types.MetadataType#local)  }

The data needed to uniquely identify a metadata specification

#### Defined in

[api/entities/Asset/types.ts:205](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/Asset/types.ts#L205)
