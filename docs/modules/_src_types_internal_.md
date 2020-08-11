# Module: "src/types/internal"

## Index

### Enumerations

* [ClaimOperation](../enums/_src_types_internal_.claimoperation.md)

### Interfaces

* [AuthTarget](../interfaces/_src_types_internal_.authtarget.md)
* [GraphqlQuery](../interfaces/_src_types_internal_.graphqlquery.md)
* [TransactionSpec](../interfaces/_src_types_internal_.transactionspec.md)

### Type aliases

* [Extrinsics](_src_types_internal_.md#extrinsics)
* [MapMaybePostTransactionValue](_src_types_internal_.md#mapmaybeposttransactionvalue)
* [MaybePostTransactionValue](_src_types_internal_.md#maybeposttransactionvalue)
* [PolymeshTx](_src_types_internal_.md#polymeshtx)
* [PostTransactionValueArray](_src_types_internal_.md#posttransactionvaluearray)
* [Queries](_src_types_internal_.md#queries)
* [ResolverFunctionArray](_src_types_internal_.md#resolverfunctionarray)

## Type aliases

###  Extrinsics

Ƭ **Extrinsics**: *SubmittableExtrinsics‹"promise"›*

*Defined in [src/types/internal.ts:17](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L17)*

Polkadot's `tx` submodule

___

###  MapMaybePostTransactionValue

Ƭ **MapMaybePostTransactionValue**: *object*

*Defined in [src/types/internal.ts:58](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L58)*

Apply the [MaybePostTransactionValue](_src_types_internal_.md#maybeposttransactionvalue) type to all members of a tuple

#### Type declaration:

___

###  MaybePostTransactionValue

Ƭ **MaybePostTransactionValue**: *PostTransactionValue‹T› | T*

*Defined in [src/types/internal.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L53)*

Either a specific type or a [[PostTransactionValue]] that wraps a value of that type

___

###  PolymeshTx

Ƭ **PolymeshTx**: *AugmentedSubmittable‹function›*

*Defined in [src/types/internal.ts:29](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L29)*

Low level transaction method in the polkadot API

___

###  PostTransactionValueArray

Ƭ **PostTransactionValueArray**: *object*

*Defined in [src/types/internal.ts:46](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L46)*

Transforms a tuple of types into an array of [[PostTransactionValue]].
For each type in the tuple, the corresponding [[PostTransactionValue]] resolves to that type

#### Type declaration:

___

###  Queries

Ƭ **Queries**: *QueryableStorage‹"promise"›*

*Defined in [src/types/internal.ts:22](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L22)*

Polkadot's `query` submodule

___

###  ResolverFunctionArray

Ƭ **ResolverFunctionArray**: *object*

*Defined in [src/types/internal.ts:36](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/types/internal.ts#L36)*

Transforms a tuple of types into an array of resolver functions. For each type in the tuple, the corresponding resolver function returns that type wrapped in a promise

#### Type declaration:
