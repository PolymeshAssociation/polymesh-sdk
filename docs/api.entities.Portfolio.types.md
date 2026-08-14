[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Portfolio/types

# api/entities/Portfolio/types

## Interfaces

### HistoricSettlement

Defined in: [api/entities/Portfolio/types.ts:31](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L31)

#### Properties

##### accounts

> **accounts**: [`Account`](../wiki/api.entities.Account#account)[]

Defined in: [api/entities/Portfolio/types.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L38)

Array of Accounts that participated by affirming the settlement

##### blockHash

> **blockHash**: `string`

Defined in: [api/entities/Portfolio/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L33)

##### blockNumber

> **blockNumber**: `BigNumber`

Defined in: [api/entities/Portfolio/types.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L32)

##### instruction?

> `optional` **instruction?**: [`Instruction`](../wiki/api.entities.Instruction#instruction)

Defined in: [api/entities/Portfolio/types.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L43)

This value is null when depicting portfolio movements

##### legs

> **legs**: [`SettlementLeg`](../wiki/#settlementleg)[]

Defined in: [api/entities/Portfolio/types.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L39)

##### status

> **status**: [`InstructionStatusEnum`](../wiki/api.client.types#instructionstatusenum)

Defined in: [api/entities/Portfolio/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L34)

***

### PortfolioBalance

Defined in: [api/entities/Portfolio/types.ts:7](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L7)

#### Extends

- [`Balance`](../wiki/api.entities.Account.types#balance)

#### Properties

##### asset

> **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible#fungibleasset)

Defined in: [api/entities/Portfolio/types.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L8)

##### free

> **free**: `BigNumber`

Defined in: [api/entities/Account/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L11)

balance available for transferring

###### Inherited from

[`Balance`](../wiki/api.entities.Account.types#balance).[`free`](../wiki/api.entities.Account.types#free-1)

##### locked

> **locked**: `BigNumber`

Defined in: [api/entities/Account/types.ts:15](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L15)

unavailable balance, locked for some purpose (e.g. pending settlement instructions)

###### Inherited from

[`Balance`](../wiki/api.entities.Account.types#balance).[`locked`](../wiki/api.entities.Account.types#locked-1)

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Account/types.ts:19](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/types.ts#L19)

free + locked

###### Inherited from

[`Balance`](../wiki/api.entities.Account.types#balance).[`total`](../wiki/api.entities.Account.types#total-1)

***

### PortfolioCollection

Defined in: [api/entities/Portfolio/types.ts:11](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L11)

#### Properties

##### collection

> **collection**: [`NftCollection`](../wiki/api.entities.Asset.NonFungible.NftCollection#nftcollection)

Defined in: [api/entities/Portfolio/types.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L12)

##### free

> **free**: [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[]

Defined in: [api/entities/Portfolio/types.ts:16](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L16)

NFTs available for transferring

##### locked

> **locked**: [`Nft`](../wiki/api.entities.Asset.NonFungible.Nft#nft)[]

Defined in: [api/entities/Portfolio/types.ts:20](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L20)

NFTs that are locked, such as being involved in a pending instruction

##### total

> **total**: `BigNumber`

Defined in: [api/entities/Portfolio/types.ts:24](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L24)

Total number of NFTs held for a collection

## Type Aliases

### SettlementLeg

> **SettlementLeg** = [`Leg`](../wiki/api.entities.Instruction.types#leg) & `object`

Defined in: [api/entities/Portfolio/types.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Portfolio/types.ts#L27)

#### Type Declaration

##### direction

> **direction**: [`SettlementDirectionEnum`](../wiki/types#settlementdirectionenum)
