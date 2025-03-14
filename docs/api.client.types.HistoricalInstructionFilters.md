# Interface: HistoricalInstructionFilters

[api/client/types](../wiki/api.client.types).HistoricalInstructionFilters

Filters for instructions

## Table of contents

### Properties

- [asset](../wiki/api.client.types.HistoricalInstructionFilters#asset)
- [identity](../wiki/api.client.types.HistoricalInstructionFilters#identity)
- [mediator](../wiki/api.client.types.HistoricalInstructionFilters#mediator)
- [party](../wiki/api.client.types.HistoricalInstructionFilters#party)
- [receiver](../wiki/api.client.types.HistoricalInstructionFilters#receiver)
- [sender](../wiki/api.client.types.HistoricalInstructionFilters#sender)
- [size](../wiki/api.client.types.HistoricalInstructionFilters#size)
- [start](../wiki/api.client.types.HistoricalInstructionFilters#start)
- [status](../wiki/api.client.types.HistoricalInstructionFilters#status)

## Properties

### asset

• `Optional` **asset**: `string` \| [`Asset`](../wiki/api.entities.Asset.types#asset)

The asset ID to filter by

#### Defined in

[api/client/types.ts:229](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L229)

___

### identity

• `Optional` **identity**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

The DID of the identity to filter by

#### Defined in

[api/client/types.ts:225](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L225)

___

### mediator

• `Optional` **mediator**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

The mediator did to filter by

#### Defined in

[api/client/types.ts:245](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L245)

___

### party

• `Optional` **party**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

The party did to filter by

#### Defined in

[api/client/types.ts:249](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L249)

___

### receiver

• `Optional` **receiver**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

The receiver did to filter by

#### Defined in

[api/client/types.ts:241](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L241)

___

### sender

• `Optional` **sender**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

The sender did to filter by

#### Defined in

[api/client/types.ts:237](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L237)

___

### size

• `Optional` **size**: `BigNumber`

The number of results to return

#### Defined in

[api/client/types.ts:253](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L253)

___

### start

• `Optional` **start**: `BigNumber`

The number of results to skip

#### Defined in

[api/client/types.ts:257](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L257)

___

### status

• `Optional` **status**: [`InstructionStatusEnum`](../wiki/api.client.types.InstructionStatusEnum)

The status to filter by

#### Defined in

[api/client/types.ts:233](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/types.ts#L233)
