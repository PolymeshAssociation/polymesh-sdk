# Enumeration: ErrorCode

[api/client/types](../wiki/api.client.types).ErrorCode

Specifies possible types of errors in the SDK

## Table of contents

### Enumeration Members

- [DataUnavailable](../wiki/api.client.types.ErrorCode#dataunavailable)
- [EntityInUse](../wiki/api.client.types.ErrorCode#entityinuse)
- [FatalError](../wiki/api.client.types.ErrorCode#fatalerror)
- [General](../wiki/api.client.types.ErrorCode#general)
- [InsufficientBalance](../wiki/api.client.types.ErrorCode#insufficientbalance)
- [LimitExceeded](../wiki/api.client.types.ErrorCode#limitexceeded)
- [MiddlewareError](../wiki/api.client.types.ErrorCode#middlewareerror)
- [NoDataChange](../wiki/api.client.types.ErrorCode#nodatachange)
- [NotAuthorized](../wiki/api.client.types.ErrorCode#notauthorized)
- [TransactionAborted](../wiki/api.client.types.ErrorCode#transactionaborted)
- [TransactionRejectedByUser](../wiki/api.client.types.ErrorCode#transactionrejectedbyuser)
- [TransactionReverted](../wiki/api.client.types.ErrorCode#transactionreverted)
- [UnexpectedError](../wiki/api.client.types.ErrorCode#unexpectederror)
- [UnmetPrerequisite](../wiki/api.client.types.ErrorCode#unmetprerequisite)
- [ValidationError](../wiki/api.client.types.ErrorCode#validationerror)

## Enumeration Members

### DataUnavailable

• **DataUnavailable** = ``"DataUnavailable"``

the data that is being fetched does not exist on-chain, or relies on non-existent data. There are
  some cases where the data did exist at some point, but has been deleted to save storage space

#### Defined in

[api/client/types.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L95)

___

### EntityInUse

• **EntityInUse** = ``"EntityInUse"``

this type of error is thrown when attempting to delete/modify an entity which has other entities depending on it. For example, deleting
  a Portfolio that still holds assets, or removing a Checkpoint Schedule that is being referenced by a Corporate Action

#### Defined in

[api/client/types.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L117)

___

### FatalError

• **FatalError** = ``"FatalError"``

error that should cause termination of the calling application

#### Defined in

[api/client/types.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L77)

___

### General

• **General** = ``"General"``

general purpose errors that don't fit well into the other categories

#### Defined in

[api/client/types.ts:130](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L130)

___

### InsufficientBalance

• **InsufficientBalance** = ``"InsufficientBalance"``

one or more parties involved in the transaction do not have enough balance to perform it

#### Defined in

[api/client/types.ts:121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L121)

___

### LimitExceeded

• **LimitExceeded** = ``"LimitExceeded"``

the data that is being written to the chain would result in some limit being exceeded. For example, adding a transfer
  restriction when the maximum possible amount has already been added

#### Defined in

[api/client/types.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L105)

___

### MiddlewareError

• **MiddlewareError** = ``"MiddlewareError"``

errors encountered when interacting with the historic data middleware (GQL server)

#### Defined in

[api/client/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L90)

___

### NoDataChange

• **NoDataChange** = ``"NoDataChange"``

the data that is being written to the chain is the same data that is already in place. This would result
  in a redundant/useless transaction being executed

#### Defined in

[api/client/types.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L100)

___

### NotAuthorized

• **NotAuthorized** = ``"NotAuthorized"``

user does not have the required roles/permissions to perform an operation

#### Defined in

[api/client/types.ts:86](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L86)

___

### TransactionAborted

• **TransactionAborted** = ``"TransactionAborted"``

transaction removed from the tx pool

#### Defined in

[api/client/types.ts:63](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L63)

___

### TransactionRejectedByUser

• **TransactionRejectedByUser** = ``"TransactionRejectedByUser"``

user rejected the transaction in their wallet

#### Defined in

[api/client/types.ts:67](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L67)

___

### TransactionReverted

• **TransactionReverted** = ``"TransactionReverted"``

transaction failed due to an on-chain error. This is a business logic error,
  and it should be caught by the SDK before being sent to the chain.
  Please report it to the Polymesh team

#### Defined in

[api/client/types.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L73)

___

### UnexpectedError

• **UnexpectedError** = ``"UnexpectedError"``

errors that are the result of something unforeseen.
  These should generally be reported to the Polymesh team

#### Defined in

[api/client/types.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L126)

___

### UnmetPrerequisite

• **UnmetPrerequisite** = ``"UnmetPrerequisite"``

one or more base prerequisites for a transaction to be successful haven't been met. For example, reserving a ticker requires
  said ticker to not be already reserved. Attempting to reserve a ticker without that prerequisite being met would result in this
  type of error. Attempting to create an entity that already exists would also fall into this category,
  if the entity in question is supposed to be unique

#### Defined in

[api/client/types.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L112)

___

### ValidationError

• **ValidationError** = ``"ValidationError"``

user input error. This means that one or more inputs passed by the user
  do not conform to expected value ranges or types

#### Defined in

[api/client/types.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/types.ts#L82)
