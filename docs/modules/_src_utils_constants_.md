# Module: "src/utils/constants"

## Index

### Variables

* [BATCH_REGEX](_src_utils_constants_.md#const-batch_regex)
* [DEFAULT_GQL_PAGE_SIZE](_src_utils_constants_.md#const-default_gql_page_size)
* [DUMMY_ACCOUNT_ID](_src_utils_constants_.md#const-dummy_account_id)
* [IGNORE_CHECKSUM](_src_utils_constants_.md#const-ignore_checksum)
* [MAX_CONCURRENT_REQUESTS](_src_utils_constants_.md#const-max_concurrent_requests)
* [MAX_DECIMALS](_src_utils_constants_.md#const-max_decimals)
* [MAX_MODULE_LENGTH](_src_utils_constants_.md#const-max_module_length)
* [MAX_TICKER_LENGTH](_src_utils_constants_.md#const-max_ticker_length)
* [MAX_TOKEN_AMOUNT](_src_utils_constants_.md#const-max_token_amount)
* [ROOT_TYPES](_src_utils_constants_.md#const-root_types)
* [SS58_FORMAT](_src_utils_constants_.md#const-ss58_format)
* [TREASURY_MODULE_ADDRESS](_src_utils_constants_.md#const-treasury_module_address)

### Object literals

* [MAX_BATCH_ELEMENTS](_src_utils_constants_.md#const-max_batch_elements)

## Variables

### `Const` BATCH_REGEX

• **BATCH_REGEX**: *RegExp‹›* = RegExp('(b|s?B)atch')

*Defined in [src/utils/constants.ts:27](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L27)*

___

### `Const` DEFAULT_GQL_PAGE_SIZE

• **DEFAULT_GQL_PAGE_SIZE**: *25* = 25

*Defined in [src/utils/constants.ts:28](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L28)*

___

### `Const` DUMMY_ACCOUNT_ID

• **DUMMY_ACCOUNT_ID**: *"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"* = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"

*Defined in [src/utils/constants.ts:10](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L10)*

___

### `Const` IGNORE_CHECKSUM

• **IGNORE_CHECKSUM**: *true* = true

*Defined in [src/utils/constants.ts:23](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L23)*

___

### `Const` MAX_CONCURRENT_REQUESTS

• **MAX_CONCURRENT_REQUESTS**: *200* = 200

*Defined in [src/utils/constants.ts:25](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L25)*

___

### `Const` MAX_DECIMALS

• **MAX_DECIMALS**: *6* = 6

*Defined in [src/utils/constants.ts:6](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L6)*

___

### `Const` MAX_MODULE_LENGTH

• **MAX_MODULE_LENGTH**: *32* = 32

*Defined in [src/utils/constants.ts:8](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L8)*

___

### `Const` MAX_TICKER_LENGTH

• **MAX_TICKER_LENGTH**: *12* = 12

*Defined in [src/utils/constants.ts:7](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L7)*

___

### `Const` MAX_TOKEN_AMOUNT

• **MAX_TOKEN_AMOUNT**: *BigNumber‹›* = new BigNumber(Math.pow(10, 12))

*Defined in [src/utils/constants.ts:9](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L9)*

___

### `Const` ROOT_TYPES

• **ROOT_TYPES**: *Record‹string, [Did](../enums/_src_types_index_.transactionargumenttype.md#did) | [Address](../enums/_src_types_index_.transactionargumenttype.md#address) | [Text](../enums/_src_types_index_.transactionargumenttype.md#text) | [Boolean](../enums/_src_types_index_.transactionargumenttype.md#boolean) | [Number](../enums/_src_types_index_.transactionargumenttype.md#number) | [Balance](../enums/_src_types_index_.transactionargumenttype.md#balance) | [Date](../enums/_src_types_index_.transactionargumenttype.md#date)›* = rootTypes

*Defined in [src/utils/constants.ts:88](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L88)*

___

### `Const` SS58_FORMAT

• **SS58_FORMAT**: *42* = 42

*Defined in [src/utils/constants.ts:24](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L24)*

___

### `Const` TREASURY_MODULE_ADDRESS

• **TREASURY_MODULE_ADDRESS**: *"modlpm/trsry"* = "modlpm/trsry"

*Defined in [src/utils/constants.ts:26](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L26)*

## Object literals

### `Const` MAX_BATCH_ELEMENTS

### ▪ **MAX_BATCH_ELEMENTS**: *object*

*Defined in [src/utils/constants.ts:11](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L11)*

###  [TxTags.asset.AddDocuments]

• **[TxTags.asset.AddDocuments]**: *number* = 20

*Defined in [src/utils/constants.ts:13](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L13)*

###  [TxTags.asset.BatchIssue]

• **[TxTags.asset.BatchIssue]**: *number* = 200

*Defined in [src/utils/constants.ts:12](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L12)*

###  [TxTags.asset.RemoveDocuments]

• **[TxTags.asset.RemoveDocuments]**: *number* = 20

*Defined in [src/utils/constants.ts:14](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L14)*

###  [TxTags.complianceManager.AddDefaultTrustedClaimIssuersBatch]

• **[TxTags.complianceManager.AddDefaultTrustedClaimIssuersBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:21](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L21)*

###  [TxTags.complianceManager.RemoveDefaultTrustedClaimIssuersBatch]

• **[TxTags.complianceManager.RemoveDefaultTrustedClaimIssuersBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:20](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L20)*

###  [TxTags.identity.AddClaimsBatch]

• **[TxTags.identity.AddClaimsBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:18](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L18)*

###  [TxTags.identity.BatchAcceptAuthorization]

• **[TxTags.identity.BatchAcceptAuthorization]**: *number* = 100

*Defined in [src/utils/constants.ts:15](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L15)*

###  [TxTags.identity.BatchRemoveAuthorization]

• **[TxTags.identity.BatchRemoveAuthorization]**: *number* = 100

*Defined in [src/utils/constants.ts:17](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L17)*

###  [TxTags.identity.RevokeClaimsBatch]

• **[TxTags.identity.RevokeClaimsBatch]**: *number* = 200

*Defined in [src/utils/constants.ts:19](https://github.com/PolymathNetwork/polymesh-sdk/blob/2aa4a44/src/utils/constants.ts#L19)*
