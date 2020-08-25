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

*Defined in [src/types/internal.ts:80](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L80)*

arguments that the transaction will receive (some of them can be [[PostTransactionValue]] from an earlier transaction)

___

###  batchSize

• **batchSize**: *number | null*

*Defined in [src/types/internal.ts:100](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L100)*

number of elements in the batch (only applicable to batch transactions)

___

###  fee

• **fee**: *BigNumber | null*

*Defined in [src/types/internal.ts:96](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L96)*

any protocol fees associated with running the transaction (not gas)

___

###  isCritical

• **isCritical**: *boolean*

*Defined in [src/types/internal.ts:92](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L92)*

whether this tx failing makes the entire tx queue fail or not

___

### `Optional` postTransactionValues

• **postTransactionValues**? : *[PostTransactionValueArray](../modules/types.md#posttransactionvaluearray)‹Values›*

*Defined in [src/types/internal.ts:84](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L84)*

wrapped values that will be returned after this transaction is run

___

###  signer

• **signer**: *AddressOrPair*

*Defined in [src/types/internal.ts:88](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L88)*

account that will sign the transaction

___

###  tx

• **tx**: *[MaybePostTransactionValue](../modules/types.md#maybeposttransactionvalue)‹[PolymeshTx](../modules/types.md#polymeshtx)‹Args››*

*Defined in [src/types/internal.ts:76](https://github.com/PolymathNetwork/polymesh-sdk/blob/7e9a732/src/types/internal.ts#L76)*

underlying polkadot transaction object
