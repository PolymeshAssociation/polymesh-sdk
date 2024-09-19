# Interface: HistoricSettlement

[api/entities/Portfolio/types](../wiki/api.entities.Portfolio.types).HistoricSettlement

## Table of contents

### Properties

- [accounts](../wiki/api.entities.Portfolio.types.HistoricSettlement#accounts)
- [blockHash](../wiki/api.entities.Portfolio.types.HistoricSettlement#blockhash)
- [blockNumber](../wiki/api.entities.Portfolio.types.HistoricSettlement#blocknumber)
- [instruction](../wiki/api.entities.Portfolio.types.HistoricSettlement#instruction)
- [legs](../wiki/api.entities.Portfolio.types.HistoricSettlement#legs)
- [status](../wiki/api.entities.Portfolio.types.HistoricSettlement#status)

## Properties

### accounts

• **accounts**: [`Account`](../wiki/api.entities.Account.Account)[]

Array of Accounts that participated by affirming the settlement

#### Defined in

[api/entities/Portfolio/types.ts:38](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L38)

___

### blockHash

• **blockHash**: `string`

#### Defined in

[api/entities/Portfolio/types.ts:33](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L33)

___

### blockNumber

• **blockNumber**: `BigNumber`

#### Defined in

[api/entities/Portfolio/types.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L32)

___

### instruction

• `Optional` **instruction**: [`Instruction`](../wiki/api.entities.Instruction.Instruction)

This value is null when depicting portfolio movements

#### Defined in

[api/entities/Portfolio/types.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L43)

___

### legs

• **legs**: [`SettlementLeg`](../wiki/api.entities.Portfolio.types#settlementleg)[]

#### Defined in

[api/entities/Portfolio/types.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L39)

___

### status

• **status**: [`SettlementResultEnum`](../wiki/types.SettlementResultEnum)

#### Defined in

[api/entities/Portfolio/types.ts:34](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/entities/Portfolio/types.ts#L34)
