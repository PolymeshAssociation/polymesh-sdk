# Module: "src/utils/index"

## Index

### Functions

* [batchArguments](_src_utils_index_.md#batcharguments)
* [requestAtBlock](_src_utils_index_.md#requestatblock)
* [requestPaginated](_src_utils_index_.md#requestpaginated)
* [unwrapValue](_src_utils_index_.md#unwrapvalue)
* [unwrapValues](_src_utils_index_.md#unwrapvalues)

## Functions

###  batchArguments

▸ **batchArguments**‹**Args**›(`args`: Args[], `tag`: keyof typeof MAX_BATCH_ELEMENTS, `groupByFn?`: undefined | function): *Args[][]*

*Defined in [src/utils/index.ts:1134](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/index.ts#L1134)*

Separates an array into smaller batches

**Type parameters:**

▪ **Args**

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`args` | Args[] | elements to separate |
`tag` | keyof typeof MAX_BATCH_ELEMENTS | transaction for which the elements are arguments. This serves to determine the size of the batches |
`groupByFn?` | undefined &#124; function | optional function that takes an element and returns a value by which to group the elements.   If supplied, all elements of the same group will be contained in the same batch  |

**Returns:** *Args[][]*

___

###  requestAtBlock

▸ **requestAtBlock**‹**F**›(`query`: AugmentedQuery‹"promise", F› | AugmentedQueryDoubleMap‹"promise", F›, `opts`: object): *Promise‹ObsInnerType‹ReturnType‹F›››*

*Defined in [src/utils/index.ts:1110](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/index.ts#L1110)*

Makes a request to the chain. If a block hash is supplied,
the request will be made at that block. Otherwise, the most recent block will be queried

**Type parameters:**

▪ **F**: *AnyFunction*

**Parameters:**

▪ **query**: *AugmentedQuery‹"promise", F› | AugmentedQueryDoubleMap‹"promise", F›*

▪ **opts**: *object*

Name | Type |
------ | ------ |
`args` | Parameters‹F› |
`blockHash?` | undefined &#124; string |

**Returns:** *Promise‹ObsInnerType‹ReturnType‹F›››*

___

###  requestPaginated

▸ **requestPaginated**‹**F**›(`query`: AugmentedQuery‹"promise", F› | AugmentedQueryDoubleMap‹"promise", F›, `opts`: object): *Promise‹object›*

*Defined in [src/utils/index.ts:1071](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/index.ts#L1071)*

Makes an entries request to the chain. If pagination options are supplied,
the request will be paginated. Otherwise, all entries will be requested at once

**Type parameters:**

▪ **F**: *AnyFunction*

**Parameters:**

▪ **query**: *AugmentedQuery‹"promise", F› | AugmentedQueryDoubleMap‹"promise", F›*

▪ **opts**: *object*

Name | Type |
------ | ------ |
`arg?` | Parameters‹F›[0] |
`paginationOpts?` | [PaginationOptions](../interfaces/_src_types_index_.paginationoptions.md) |

**Returns:** *Promise‹object›*

___

###  unwrapValue

▸ **unwrapValue**‹**T**›(`value`: [MaybePostTransactionValue](_src_types_internal_.md#maybeposttransactionvalue)‹T›): *T*

*Defined in [src/utils/index.ts:1014](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/index.ts#L1014)*

Unwrap a Post Transaction Value

**Type parameters:**

▪ **T**: *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [MaybePostTransactionValue](_src_types_internal_.md#maybeposttransactionvalue)‹T› |

**Returns:** *T*

___

###  unwrapValues

▸ **unwrapValues**‹**T**›(`values`: [MapMaybePostTransactionValue](_src_types_internal_.md#mapmaybeposttransactionvalue)‹T›): *T*

*Defined in [src/utils/index.ts:1025](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/index.ts#L1025)*

Unwrap all Post Transaction Values present in a tuple

**Type parameters:**

▪ **T**: *unknown[]*

**Parameters:**

Name | Type |
------ | ------ |
`values` | [MapMaybePostTransactionValue](_src_types_internal_.md#mapmaybeposttransactionvalue)‹T› |

**Returns:** *T*
