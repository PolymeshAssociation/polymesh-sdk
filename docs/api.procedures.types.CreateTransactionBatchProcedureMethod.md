# Interface: CreateTransactionBatchProcedureMethod

[api/procedures/types](../wiki/api.procedures.types).CreateTransactionBatchProcedureMethod

## Callable

### CreateTransactionBatchProcedureMethod

▸ **CreateTransactionBatchProcedureMethod**\<`ReturnValues`\>(`args`, `opts?`): `Promise`\<[`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch)\<`ReturnValues`, `ReturnValues`, `unknown`[][]\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValues` | extends readonly `unknown`[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)\<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`PolymeshTransactionBatch`](../wiki/base.PolymeshTransactionBatch.PolymeshTransactionBatch)\<`ReturnValues`, `ReturnValues`, `unknown`[][]\>\>

#### Defined in

[api/procedures/types.ts:149](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L149)

## Table of contents

### Properties

- [checkAuthorization](../wiki/api.procedures.types.CreateTransactionBatchProcedureMethod#checkauthorization)

## Properties

### checkAuthorization

• **checkAuthorization**: \<ReturnValues\>(`args`: [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)\<`ReturnValues`\>, `opts?`: [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts)) => `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/api.procedures.types.ProcedureAuthorizationStatus)\>

#### Type declaration

▸ \<`ReturnValues`\>(`args`, `opts?`): `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/api.procedures.types.ProcedureAuthorizationStatus)\>

##### Type parameters

| Name | Type |
| :------ | :------ |
| `ReturnValues` | extends `unknown`[] |

##### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateTransactionBatchParams`](../wiki/api.procedures.types.CreateTransactionBatchParams)\<`ReturnValues`\> |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

##### Returns

`Promise`\<[`ProcedureAuthorizationStatus`](../wiki/api.procedures.types.ProcedureAuthorizationStatus)\>

#### Defined in

[api/procedures/types.ts:153](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/procedures/types.ts#L153)
