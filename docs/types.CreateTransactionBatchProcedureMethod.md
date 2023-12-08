# Interface: CreateTransactionBatchProcedureMethod

[types](../wiki/types).CreateTransactionBatchProcedureMethod

## Callable

### CreateTransactionBatchProcedureMethod

▸ **CreateTransactionBatchProcedureMethod**<`ReturnValues`\>(`args`, `opts?`): `Promise`<[`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch)<`ReturnValues`, `ReturnValues`, `unknown`[][]\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValues` | extends readonly `unknown`[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

#### Returns

`Promise`<[`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch)<`ReturnValues`, `ReturnValues`, `unknown`[][]\>\>

## Table of contents

### Properties

- [checkAuthorization](../wiki/types.CreateTransactionBatchProcedureMethod#checkauthorization)

## Properties

### checkAuthorization

• **checkAuthorization**: <ReturnValues\>(`args`: [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)<`ReturnValues`\>, `opts?`: [`ProcedureOpts`](../wiki/types.ProcedureOpts)) => `Promise`<[`ProcedureAuthorizationStatus`](../wiki/types.ProcedureAuthorizationStatus)\>

#### Type declaration

▸ <`ReturnValues`\>(`args`, `opts?`): `Promise`<[`ProcedureAuthorizationStatus`](../wiki/types.ProcedureAuthorizationStatus)\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValues` | extends `unknown`[] |

##### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/types.ProcedureOpts) |

##### Returns

`Promise`<[`ProcedureAuthorizationStatus`](../wiki/types.ProcedureAuthorizationStatus)\>

#### Defined in

[types/index.ts:1500](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1500)
