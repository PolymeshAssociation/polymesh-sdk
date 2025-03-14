# Interface: ProcedureOpts

[api/procedures/types](../wiki/api.procedures.types).ProcedureOpts

## Table of contents

### Properties

- [mortality](../wiki/api.procedures.types.ProcedureOpts#mortality)
- [multiSigOpts](../wiki/api.procedures.types.ProcedureOpts#multisigopts)
- [nonce](../wiki/api.procedures.types.ProcedureOpts#nonce)
- [signingAccount](../wiki/api.procedures.types.ProcedureOpts#signingaccount)
- [skipChecks](../wiki/api.procedures.types.ProcedureOpts#skipchecks)

## Properties

### mortality

• `Optional` **mortality**: [`MortalityProcedureOpt`](../wiki/api.procedures.types#mortalityprocedureopt)

This option allows for transactions that never expire, aka "immortal". By default, a transaction is only valid for approximately 5 minutes (250 blocks) after its construction. Allows for transaction construction to be decoupled from its submission, such as requiring manual approval for the signing or providing "at least once" guarantees.

More information can be found [here](https://wiki.polkadot.network/docs/build-protocol-info#transaction-mortality). Note the Polymesh chain will **never** reap Accounts, so the risk of a replay attack is mitigated.

#### Defined in

[api/procedures/types.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L133)

___

### multiSigOpts

• `Optional` **multiSigOpts**: [`MultiSigProcedureOpt`](../wiki/api.procedures.types.MultiSigProcedureOpt)

These options will only apply when the `signingAccount` is a MultiSig signer and the transaction is being wrapped as a proposal

#### Defined in

[api/procedures/types.ts:138](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L138)

___

### nonce

• `Optional` **nonce**: `BigNumber` \| `Promise`\<`BigNumber`\> \| () => `BigNumber` \| `Promise`\<`BigNumber`\>

nonce value for signing the transaction

An [Account](../wiki/api.entities.Account.Account) can directly fetch its current nonce by calling [account.getCurrentNonce](../wiki/api.entities.Account.Account#getcurrentnonce). More information can be found at: https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-take-the-pending-tx-pool-into-account-in-my-nonce

**`Note`**

the passed value can be either the nonce itself or a function that returns the nonce. This allows, for example, passing a closure that increases the returned value every time it's called, or a function that fetches the nonce from the chain or a different source

#### Defined in

[api/procedures/types.ts:126](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L126)

___

### signingAccount

• `Optional` **signingAccount**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

Account or address of a signing key to replace the current one (for this procedure only)

#### Defined in

[api/procedures/types.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L117)

___

### skipChecks

• `Optional` **skipChecks**: [`SkipChecksOpt`](../wiki/api.procedures.types.SkipChecksOpt)

This option allows for skipping checks for the Procedure. By default, all checks are performed.

This can be useful while batching transactions which could have failed due to insufficient roles or permissions individually, but you don't want to fail the entire batch.

**`Note`**

even if the checks are skipped from being validated on the SDK, they will still be validated on the chain

#### Defined in

[api/procedures/types.ts:147](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L147)
