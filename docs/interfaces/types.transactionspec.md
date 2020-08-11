# Interface: TransactionSpec ‹**Args, Values**›

Schema of a specific transaction

## Type parameters

▪ **Args**: *unknown[]*

arguments of the transaction

▪ **Values**: *unknown[]*

values that will be returned wrapped in [[PostTransactionValue]] after the transaction runs

## Hierarchy

* **TransactionSpec**

## Index

### Properties

* [args](types.transactionspec.md#args)
* [batchSize](types.transactionspec.md#batchsize)
* [fee](types.transactionspec.md#fee)
* [isCritical](types.transactionspec.md#iscritical)
* [postTransactionValues](types.transactionspec.md#optional-posttransactionvalues)
* [signer](types.transactionspec.md#signer)
* [tx](types.transactionspec.md#tx)

## Properties

###  args

• **args**: *[MapMaybePostTransactionValue](../modules/types.md#mapmaybeposttransactionvalue)‹Args›*

*Defined in [src/types/internal.ts:79](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L79)*

arguments that the transaction will receive (some of them can be [[PostTransactionValue]] from an earlier transaction)

___

###  batchSize

• **batchSize**: *number | null*

*Defined in [src/types/internal.ts:99](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L99)*

number of elements in the batch (only applicable to batch transactions)

___

###  fee

• **fee**: *BigNumber | null*

*Defined in [src/types/internal.ts:95](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L95)*

any protocol fees associated with running the transaction (not gas)

___

###  isCritical

• **isCritical**: *boolean*

*Defined in [src/types/internal.ts:91](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L91)*

whether this tx failing makes the entire tx queue fail or not

___

### `Optional` postTransactionValues

• **postTransactionValues**? : *[PostTransactionValueArray](../modules/types.md#posttransactionvaluearray)‹Values›*

*Defined in [src/types/internal.ts:83](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L83)*

wrapped values that will be returned after this transaction is run

___

###  signer

• **signer**: *AddressOrPair*

*Defined in [src/types/internal.ts:87](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L87)*

account that will sign the transaction

___

###  tx

• **tx**: *[MaybePostTransactionValue](../modules/types.md#maybeposttransactionvalue)‹[PolymeshTx](../modules/types.md#polymeshtx)‹Args››*

*Defined in [src/types/internal.ts:75](https://github.com/PolymathNetwork/polymesh-sdk/blob/6d34df1/src/types/internal.ts#L75)*

underlying polkadot transaction object
