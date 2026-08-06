[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![Types](https://img.shields.io/npm/types/@polymeshassociation/polymesh-sdk)](https://www.npmjs.com/package/@polymeshassociation/polymesh-sdk)
[![npm](https://img.shields.io/npm/v/@polymeshassociation/polymesh-sdk)](https://www.npmjs.com/package/@polymeshassociation/polymesh-sdk)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=PolymeshAssociation_polymesh-sdk&metric=coverage)](https://sonarcloud.io/summary/new_code?id=PolymeshAssociation_polymesh-sdk)
[![Github Actions Workflow](https://github.com/PolymeshAssociation/polymesh-sdk/actions/workflows/main.yml/badge.svg)](https://github.com/PolymeshAssociation/polymesh-sdk/actions)
[![Sonar Status](https://sonarcloud.io/api/project_badges/measure?project=PolymeshAssociation_polymesh-sdk&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=PolymeshAssociation_polymesh-sdk)
[![Issues](https://img.shields.io/github/issues/PolymeshAssociation/polymesh-sdk)](https://github.com/PolymeshAssociation/polymesh-sdk/issues)

## @polymeshassociation/polymesh-sdk

## Polymesh version

This release is compatible with Polymesh v7.3-v8.0

## Getting Started

### Purpose

The Polymesh SDK's main goal is to provide external developers with a set of tools that will allow them to build powerful applications that interact with the Polymesh protocol. It focuses on abstracting away all the complexities of the Polymesh blockchain and expose a simple but complete interface. The result is a feature-rich, user-friendly JS library.

### Technical Pre-requisites

In order to use the Polymesh SDK, you must install [node](https://nodejs.org/) \(minimum version 20, version 22 recommended\) and [npm](https://www.npmjs.com/). The library is written in [typescript](https://www.typescriptlang.org/), but can also be used in plain javascript. This document will assume you are using typescript, but the translation to javascript is very simple.

### Documentation

Polymesh SDK API Reference:

https://developers.polymesh.network/sdk-docs/

### How to use

#### Installation

`npm i @polymeshassociation/polymesh-sdk --save`

Or, if you're using yarn

`yarn add @polymeshassociation/polymesh-sdk`

Or, if using pnpm

`pnpm add @polymeshassociation/polymesh-sdk`

**NOTE** it is _highly_ recommended that you use one of these three package managers. This project uses package resolutions/overrides to pin certain problematic dependencies, and these are only supported by the aforementioned package managers. Using a different package manager may result in unexpected behavior

**NOTE** if using TypeScript the compiler option "skipLibCheck" should be set to true in your tsconfig.json file to avoid type errors from third-party dependencies.

#### Initializing the client

Before you can start registering Tickers and creating Assets, you have to connect the Polymesh SDK client to a Polymesh node. This is a pretty straightforward process:

```typescript
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';

async function run() {
  const signingManager = await LocalSigningManager.create({
    accounts: [
      {
        mnemonic: '//Alice', //A "well known" mnemonic, often with sudo privileges on development chains
      },
      {
        mnemonic: 'forest end mail art wish leave truth else ignore royal knife river', // most mnemonics are 12 words
      },
    ],
  });
  const polyClient = await Polymesh.connect({
    nodeUrl: 'wss://some-node-url.com',
    signingManager,
  });

  // do stuff with the client
}
```

Here is an overview of the parameters passed to the `connect` function:

- `nodeUrl` is a URL that points to a running Polymesh node
- `signingManager` is an object that complies with the `SigningManager` interface. It holds the Accounts capable of signing transactions, and the signing logic itself. In this example, `LocalSigningManager` is a simple signing manager that holds private keys in memory and signs with them

**NOTE:** if using the SDK on a browser environment \(i.e. with the Polymesh wallet browser extension\), you would use the `BrowserExtensionSigningManager` provided by `@polymeshassociation/browser-extension-signing-manager`

```typescript
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';

async function run() {
  const signingManager = await BrowserExtensionSigningManager.create('MY_APP_NAME'); // The Polymesh wallet extension will ask the user to authorize MY_APP_NAME for access

  const polyClient = await Polymesh.connect({
    nodeUrl: 'wss://some-node-url.com',
    signingManager,
  });

  // do stuff with the client
}
```

#### Creating Transactions

Creating transactions is a two-step process. First a procedure is created, which validates the chain is likely to accept the transaction and returns a Procedure object. This procedure is then executed. This includes having the signing manager generate a signature and waiting for block finalization. Some procedures resolve to a relevant entity, such as `createAsset` resolving to the created asset.

```typescript
  /**
   * This step performs validations, and will throw an error if the transaction isn't expected to proceed, e.g., if the `ticker` is already in use
   */
  const createAssetProc = await polyClient.assets.createAsset({
    name: 'My new asset'
    ticker: 'TICKER',
    // ... (args omitted for brevity)
  })

  /**
   * The promise will resolve when the transaction is in a finalized block which takes on average 15 seconds. It will throw an error if the transaction fails to finalize.
   * For example, if the `ticker` was claimed after the procedure was created, but before it was executed, or the signing manager didn't generate a correct signature.
   */
  const newAsset = await createAssetProc.run()
```

#### Creating MultiSig Proposals

If the signingAccount is a MultiSig signer, then the transaction will need to be ran with `.runAsProposal()` instead of the usual `.run()`.
The underlying transaction will be wrapped with `multiSig.createProposalAsKey` extrinsic and will resolve to the MultiSig proposal created.

Approving and rejecting existing proposals are an exception and should be submitted with `.run()`. If your application supports
MultiSig signers, then the procedure's `multiSig` param can be checked to ensure the correct method is called.

```typescript
const createAssetProc = await polyClient.assets.createAsset(args, {
  signingAccount: multiSigSigner,
});
createAssetProc.multiSig; // indicates the acting MultiSig. If set `runAsProposal` must be used
const proposal = await createAssetProc.runAsProposal();

const rejectProc = await proposal.reject({ signingAccount: multiSigSigner });
rejectProc.multiSig; // returns `null`. Rejecting a proposal does not get wrapped
await rejectProc.run();
```

#### Reading Data

The SDK exposes getter functions that will return entities, which may have their own functions:

```typescript
const assetsPage = await polyClient.assets.get({ size: new BigNumber(20) });
const asset = assetsPage.data[0];

const assetDetails = await asset.details();
console.log('asset details:', assetDetails);
```

Note: Some getters require "middleware" to be configured, which is a chain indexer that aids in historical queries. All such methods will have a comment indicating this requirement.

### Terminology

The SDK uses the class `Account` as an abstraction for a public/private key pair that is used to sign transactions. Although consistent with [Substrate](https://substrate.io/vision/substrate-and-polkadot/) (the chain's framework) naming conventions, it can be a source of confusion considering the domain. What the SDK calls an account is often referred to as a key. Public keys are often represented in [SS58 format](https://docs.substrate.io/reference/address-formats/) which is a special encoding that indicates if the key is intended for mainnet or not. In this form, it is referred to as an address and looks like: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (non-mainnet keys begin with **5**, mainnet addresses will instead begin with **2**).

The only thing an `Account` holds is the POLYX utility token. Ownership of any asset on the Polymesh chain requires an `Identity`. This process involves a trusted provider writing a claim to the chain, stating that this person has completed a "customer due diligence" (CDD) process. For development chains, the mnemonic `//Alice` can create CDD claims by default.

Polymesh uses an `Identity` to provide flexibility in managing permissions. Portfolios can be created, and secondary keys can be granted permission to provide fine grained authorization.

## Modules

- [api/client/AccountManagement](../wiki/api.client.AccountManagement)
- [api/client/Assets](../wiki/api.client.Assets)
- [api/client/Claims](../wiki/api.client.Claims)
- [api/client/Identities](../wiki/api.client.Identities)
- [api/client/Network](../wiki/api.client.Network)
- [api/client/Polymesh](../wiki/api.client.Polymesh)
- [api/client/Settlements](../wiki/api.client.Settlements)
- [api/client/Staking](../wiki/api.client.Staking)
- [api/client/types](../wiki/api.client.types)
- [api/entities/Account](../wiki/api.entities.Account)
- [api/entities/Account/helpers](../wiki/api.entities.Account.helpers)
- [api/entities/Account/MultiSig](../wiki/api.entities.Account.MultiSig)
- [api/entities/Account/MultiSig/types](../wiki/api.entities.Account.MultiSig.types)
- [api/entities/Account/Staking](../wiki/api.entities.Account.Staking)
- [api/entities/Account/types](../wiki/api.entities.Account.types)
- [api/entities/Asset](../wiki/api.entities.Asset)
- [api/entities/Asset/Base](../wiki/api.entities.Asset.Base)
- [api/entities/Asset/Base/BaseAsset](../wiki/api.entities.Asset.Base.BaseAsset)
- [api/entities/Asset/Base/Compliance](../wiki/api.entities.Asset.Base.Compliance)
- [api/entities/Asset/Base/Compliance/Requirements](../wiki/api.entities.Asset.Base.Compliance.Requirements)
- [api/entities/Asset/Base/Compliance/TrustedClaimIssuers](../wiki/api.entities.Asset.Base.Compliance.TrustedClaimIssuers)
- [api/entities/Asset/Base/Documents](../wiki/api.entities.Asset.Base.Documents)
- [api/entities/Asset/Base/Metadata](../wiki/api.entities.Asset.Base.Metadata)
- [api/entities/Asset/Base/Permissions](../wiki/api.entities.Asset.Base.Permissions)
- [api/entities/Asset/Base/Settlements](../wiki/api.entities.Asset.Base.Settlements)
- [api/entities/Asset/Fungible](../wiki/api.entities.Asset.Fungible)
- [api/entities/Asset/Fungible/AssetHolders](../wiki/api.entities.Asset.Fungible.AssetHolders)
- [api/entities/Asset/Fungible/Checkpoints](../wiki/api.entities.Asset.Fungible.Checkpoints)
- [api/entities/Asset/Fungible/Checkpoints/Schedules](../wiki/api.entities.Asset.Fungible.Checkpoints.Schedules)
- [api/entities/Asset/Fungible/Checkpoints/types](../wiki/api.entities.Asset.Fungible.Checkpoints.types)
- [api/entities/Asset/Fungible/CorporateActions](../wiki/api.entities.Asset.Fungible.CorporateActions)
- [api/entities/Asset/Fungible/CorporateActions/Ballots](../wiki/api.entities.Asset.Fungible.CorporateActions.Ballots)
- [api/entities/Asset/Fungible/CorporateActions/Distributions](../wiki/api.entities.Asset.Fungible.CorporateActions.Distributions)
- [api/entities/Asset/Fungible/CorporateActions/types](../wiki/api.entities.Asset.Fungible.CorporateActions.types)
- [api/entities/Asset/Fungible/Issuance](../wiki/api.entities.Asset.Fungible.Issuance)
- [api/entities/Asset/Fungible/Offerings](../wiki/api.entities.Asset.Fungible.Offerings)
- [api/entities/Asset/Fungible/TransferRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions)
- [api/entities/Asset/NonFungible](../wiki/api.entities.Asset.NonFungible)
- [api/entities/Asset/NonFungible/AssetHolders](../wiki/api.entities.Asset.NonFungible.AssetHolders)
- [api/entities/Asset/NonFungible/Nft](../wiki/api.entities.Asset.NonFungible.Nft)
- [api/entities/Asset/NonFungible/NftCollection](../wiki/api.entities.Asset.NonFungible.NftCollection)
- [api/entities/Asset/types](../wiki/api.entities.Asset.types)
- [api/entities/AuthorizationRequest](../wiki/api.entities.AuthorizationRequest)
- [api/entities/Checkpoint](../wiki/api.entities.Checkpoint)
- [api/entities/CheckpointSchedule](../wiki/api.entities.CheckpointSchedule)
- [api/entities/CheckpointSchedule/types](../wiki/api.entities.CheckpointSchedule.types)
- [api/entities/common/namespaces/Authorizations](../wiki/api.entities.common.namespaces.Authorizations)
- [api/entities/CorporateAction](../wiki/api.entities.CorporateAction)
- [api/entities/CorporateActionBase](../wiki/api.entities.CorporateActionBase)
- [api/entities/CorporateActionBase/types](../wiki/api.entities.CorporateActionBase.types)
- [api/entities/CorporateBallot](../wiki/api.entities.CorporateBallot)
- [api/entities/CorporateBallot/types](../wiki/api.entities.CorporateBallot.types)
- [api/entities/CustomPermissionGroup](../wiki/api.entities.CustomPermissionGroup)
- [api/entities/DefaultPortfolio](../wiki/api.entities.DefaultPortfolio)
- [api/entities/DefaultTrustedClaimIssuer](../wiki/api.entities.DefaultTrustedClaimIssuer)
- [api/entities/DividendDistribution](../wiki/api.entities.DividendDistribution)
- [api/entities/DividendDistribution/types](../wiki/api.entities.DividendDistribution.types)
- [api/entities/Entity](../wiki/api.entities.Entity)
- [api/entities/Identity](../wiki/api.entities.Identity)
- [api/entities/Identity/AssetPermissions](../wiki/api.entities.Identity.AssetPermissions)
- [api/entities/Identity/ChildIdentity](../wiki/api.entities.Identity.ChildIdentity)
- [api/entities/Identity/IdentityAuthorizations](../wiki/api.entities.Identity.IdentityAuthorizations)
- [api/entities/Identity/Portfolios](../wiki/api.entities.Identity.Portfolios)
- [api/entities/Instruction](../wiki/api.entities.Instruction)
- [api/entities/Instruction/types](../wiki/api.entities.Instruction.types)
- [api/entities/KnownPermissionGroup](../wiki/api.entities.KnownPermissionGroup)
- [api/entities/MetadataEntry](../wiki/api.entities.MetadataEntry)
- [api/entities/MetadataEntry/types](../wiki/api.entities.MetadataEntry.types)
- [api/entities/MultiSigProposal](../wiki/api.entities.MultiSigProposal)
- [api/entities/MultiSigProposal/types](../wiki/api.entities.MultiSigProposal.types)
- [api/entities/NumberedPortfolio](../wiki/api.entities.NumberedPortfolio)
- [api/entities/Offering](../wiki/api.entities.Offering)
- [api/entities/Offering/types](../wiki/api.entities.Offering.types)
- [api/entities/PermissionGroup](../wiki/api.entities.PermissionGroup)
- [api/entities/Portfolio](../wiki/api.entities.Portfolio)
- [api/entities/Portfolio/types](../wiki/api.entities.Portfolio.types)
- [api/entities/Subsidies](../wiki/api.entities.Subsidies)
- [api/entities/Subsidy](../wiki/api.entities.Subsidy)
- [api/entities/Subsidy/types](../wiki/api.entities.Subsidy.types)
- [api/entities/TickerReservation](../wiki/api.entities.TickerReservation)
- [api/entities/TickerReservation/types](../wiki/api.entities.TickerReservation.types)
- [api/entities/types](../wiki/api.entities.types)
- [api/entities/Venue](../wiki/api.entities.Venue)
- [api/entities/Venue/types](../wiki/api.entities.Venue.types)
- [api/procedures/types](../wiki/api.procedures.types)
- [base/PolymeshError](../wiki/base.PolymeshError)
- [base/PolymeshTransaction](../wiki/base.PolymeshTransaction)
- [base/PolymeshTransactionBase](../wiki/base.PolymeshTransactionBase)
- [base/PolymeshTransactionBatch](../wiki/base.PolymeshTransactionBatch)
- [base/types](../wiki/base.types)
- [base/utils](../wiki/base.utils)
- [types](../wiki/types)
- [types/txGroupConstants](../wiki/types.txGroupConstants)
- [types/utils](../wiki/types.utils)
