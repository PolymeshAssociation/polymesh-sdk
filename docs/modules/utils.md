# Module: utils

## Index

### Variables

* [BATCH_REGEX](utils.md#const-batch_regex)
* [DEFAULT_GQL_PAGE_SIZE](utils.md#const-default_gql_page_size)
* [DUMMY_ACCOUNT_ID](utils.md#const-dummy_account_id)
* [IGNORE_CHECKSUM](utils.md#const-ignore_checksum)
* [MAX_CONCURRENT_REQUESTS](utils.md#const-max_concurrent_requests)
* [MAX_DECIMALS](utils.md#const-max_decimals)
* [MAX_MODULE_LENGTH](utils.md#const-max_module_length)
* [MAX_TICKER_LENGTH](utils.md#const-max_ticker_length)
* [MAX_TOKEN_AMOUNT](utils.md#const-max_token_amount)
* [ROOT_TYPES](utils.md#const-root_types)
* [SS58_FORMAT](utils.md#const-ss58_format)
* [TREASURY_MODULE_ADDRESS](utils.md#const-treasury_module_address)
* [addressTypes](utils.md#const-addresstypes)
* [balanceTypes](utils.md#const-balancetypes)
* [booleanTypes](utils.md#const-booleantypes)
* [dateTypes](utils.md#const-datetypes)
* [didTypes](utils.md#const-didtypes)
* [numberTypes](utils.md#const-numbertypes)
* [rootTypes](utils.md#const-roottypes)
* [textTypes](utils.md#const-texttypes)

### Functions

* [batchArguments](utils.md#batcharguments)
* [requestAtBlock](utils.md#requestatblock)
* [requestPaginated](utils.md#requestpaginated)
* [unwrapValue](utils.md#unwrapvalue)
* [unwrapValues](utils.md#unwrapvalues)

### Object literals

* [MAX_BATCH_ELEMENTS](utils.md#const-max_batch_elements)

## Variables

### `Const` BATCH_REGEX

• **BATCH_REGEX**: *RegExp‹›* = RegExp('(b|s?B)atch')

*Defined in [src/utils/constants.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L27)*

___

### `Const` DEFAULT_GQL_PAGE_SIZE

• **DEFAULT_GQL_PAGE_SIZE**: *25* = 25

*Defined in [src/utils/constants.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L28)*

___

### `Const` DUMMY_ACCOUNT_ID

• **DUMMY_ACCOUNT_ID**: *"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"* = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"

*Defined in [src/utils/constants.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L10)*

___

### `Const` IGNORE_CHECKSUM

• **IGNORE_CHECKSUM**: *true* = true

*Defined in [src/utils/constants.ts:23](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L23)*

___

### `Const` MAX_CONCURRENT_REQUESTS

• **MAX_CONCURRENT_REQUESTS**: *200* = 200

*Defined in [src/utils/constants.ts:25](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L25)*

___

### `Const` MAX_DECIMALS

• **MAX_DECIMALS**: *6* = 6

*Defined in [src/utils/constants.ts:6](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L6)*

___

### `Const` MAX_MODULE_LENGTH

• **MAX_MODULE_LENGTH**: *32* = 32

*Defined in [src/utils/constants.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L8)*

___

### `Const` MAX_TICKER_LENGTH

• **MAX_TICKER_LENGTH**: *12* = 12

*Defined in [src/utils/constants.ts:7](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L7)*

___

### `Const` MAX_TOKEN_AMOUNT

• **MAX_TOKEN_AMOUNT**: *BigNumber‹›* = new BigNumber(Math.pow(10, 12))

*Defined in [src/utils/constants.ts:9](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L9)*

___

### `Const` ROOT_TYPES

• **ROOT_TYPES**: *Record‹string, [Did](../enums/types.transactionargumenttype.md#did) | [Address](../enums/types.transactionargumenttype.md#address) | [Text](../enums/types.transactionargumenttype.md#text) | [Boolean](../enums/types.transactionargumenttype.md#boolean) | [Number](../enums/types.transactionargumenttype.md#number) | [Balance](../enums/types.transactionargumenttype.md#balance) | [Date](../enums/types.transactionargumenttype.md#date)›* = rootTypes

*Defined in [src/utils/constants.ts:88](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L88)*

___

### `Const` SS58_FORMAT

• **SS58_FORMAT**: *42* = 42

*Defined in [src/utils/constants.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L24)*

___

### `Const` TREASURY_MODULE_ADDRESS

• **TREASURY_MODULE_ADDRESS**: *"modlpm/trsry"* = "modlpm/trsry"

*Defined in [src/utils/constants.ts:26](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L26)*

___

### `Const` addressTypes

• **addressTypes**: *string[]* = [
  'AccountId',
  'AccountIdOf',
  'LookupTarget',
  'Address',
  'AuthorityId',
  'SessionKey',
  'ValidatorId',
  'AuthorityId',
  'KeyType',
  'SessionKey',
]

*Defined in [src/utils/constants.ts:32](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L32)*

___

### `Const` balanceTypes

• **balanceTypes**: *string[]* = ['Amount', 'AssetOf', 'Balance', 'BalanceOf']

*Defined in [src/utils/constants.ts:45](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L45)*

___

### `Const` booleanTypes

• **booleanTypes**: *string[]* = ['bool']

*Defined in [src/utils/constants.ts:51](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L51)*

___

### `Const` dateTypes

• **dateTypes**: *string[]* = ['Moment']

*Defined in [src/utils/constants.ts:53](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L53)*

___

### `Const` didTypes

• **didTypes**: *string[]* = ['IdentityId']

*Defined in [src/utils/constants.ts:30](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L30)*

___

### `Const` numberTypes

• **numberTypes**: *string[]* = ['u8', 'u16', 'u32', 'u64', 'u128', 'u256', 'U256', 'BlockNumber']

*Defined in [src/utils/constants.ts:47](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L47)*

___

### `Const` rootTypes

• **rootTypes**: *Record‹string, [Did](../enums/types.transactionargumenttype.md#did) | [Address](../enums/types.transactionargumenttype.md#address) | [Balance](../enums/types.transactionargumenttype.md#balance) | [Number](../enums/types.transactionargumenttype.md#number) | [Text](../enums/types.transactionargumenttype.md#text) | [Boolean](../enums/types.transactionargumenttype.md#boolean) | [Date](../enums/types.transactionargumenttype.md#date)›*

*Defined in [src/utils/constants.ts:55](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L55)*

___

### `Const` textTypes

• **textTypes**: *string[]* = ['String', 'Text', 'Ticker']

*Defined in [src/utils/constants.ts:49](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L49)*

## Functions

###  batchArguments

▸ **batchArguments**‹**Args**›(`args`: Args[], `tag`: keyof typeof MAX_BATCH_ELEMENTS, `groupByFn?`: undefined | function): *Args[][]*

*Defined in [src/utils/index.ts:1134](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/index.ts#L1134)*

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

*Defined in [src/utils/index.ts:1110](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/index.ts#L1110)*

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

*Defined in [src/utils/index.ts:1071](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/index.ts#L1071)*

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
`paginationOpts?` | [PaginationOptions](../interfaces/types.paginationoptions.md) |

**Returns:** *Promise‹object›*

___

###  unwrapValue

▸ **unwrapValue**‹**T**›(`value`: [MaybePostTransactionValue](types.md#maybeposttransactionvalue)‹T›): *T*

*Defined in [src/utils/index.ts:1014](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/index.ts#L1014)*

Unwrap a Post Transaction Value

**Type parameters:**

▪ **T**: *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`value` | [MaybePostTransactionValue](types.md#maybeposttransactionvalue)‹T› |

**Returns:** *T*

___

###  unwrapValues

▸ **unwrapValues**‹**T**›(`values`: [MapMaybePostTransactionValue](types.md#mapmaybeposttransactionvalue)‹T›): *T*

*Defined in [src/utils/index.ts:1025](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/index.ts#L1025)*

Unwrap all Post Transaction Values present in a tuple

**Type parameters:**

▪ **T**: *unknown[]*

**Parameters:**

Name | Type |
------ | ------ |
`values` | [MapMaybePostTransactionValue](types.md#mapmaybeposttransactionvalue)‹T› |

**Returns:** *T*

## Object literals

### `Const` MAX_BATCH_ELEMENTS

### ▪ **MAX_BATCH_ELEMENTS**: *object*

*Defined in [src/utils/constants.ts:11](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L11)*

###  [TxTags.asset.AddDocuments]

• **[TxTags.asset.AddDocuments]**: *number* = 20

*Defined in [src/utils/constants.ts:13](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L13)*

###  [TxTags.asset.BatchIssue]

• **[TxTags.asset.BatchIssue]**: *number* = 200

*Defined in [src/utils/constants.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L12)*

###  [TxTags.asset.RemoveDocuments]

• **[TxTags.asset.RemoveDocuments]**: *number* = 20

*Defined in [src/utils/constants.ts:14](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L14)*

###  [TxTags.complianceManager.AddDefaultTrustedClaimIssuersBatch]

• **[TxTags.complianceManager.AddDefaultTrustedClaimIssuersBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:21](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L21)*

###  [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuersBatch]

• **[TxTags.complianceManager.RemoveDefaultTrustedClaimIssuersBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:20](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L20)*

###  [TxTags.identity.AddClaimsBatch]

• **[TxTags.identity.AddClaimsBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:18](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L18)*

###  [TxTags.identity.BatchAcceptAuthorization]

• **[TxTags.identity.BatchAcceptAuthorization]**: *number* = 100

*Defined in [src/utils/constants.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L15)*

###  [TxTags.identity.BatchRemoveAuthorization]

• **[TxTags.identity.BatchRemoveAuthorization]**: *number* = 100

*Defined in [src/utils/constants.ts:17](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L17)*

###  [TxTags.identity.RevokeClaimsBatch]

• **[TxTags.identity.RevokeClaimsBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:19](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/utils/constants.ts#L19)*
