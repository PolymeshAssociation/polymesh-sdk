# Interface: HistoricAgentOperation

[api/entities/Asset/types](../wiki/api.entities.Asset.types).HistoricAgentOperation

Events triggered by transactions performed by an Agent Identity, related to the Token's configuration
  For example: changing compliance requirements, inviting/removing agent Identities, freezing/unfreezing transfers

Token transfers (settlements or movements between Portfolios) do not count as Operations

## Table of contents

### Properties

- [history](../wiki/api.entities.Asset.types.HistoricAgentOperation#history)
- [identity](../wiki/api.entities.Asset.types.HistoricAgentOperation#identity)

## Properties

### history

• **history**: [`EventIdentifier`](../wiki/api.client.types.EventIdentifier)[]

list of Token Operation Events that were triggered by the Agent Identity

#### Defined in

[api/entities/Asset/types.ts:385](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L385)

___

### identity

• **identity**: [`Identity`](../wiki/api.entities.Identity.Identity)

Agent Identity that performed the operations

#### Defined in

[api/entities/Asset/types.ts:381](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Asset/types.ts#L381)
