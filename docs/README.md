# @polymathnetwork/polymesh-sdk

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=PolymathNetwork_polymesh-sdk&metric=coverage)](https://sonarcloud.io/dashboard?id=PolymathNetwork_polymesh-sdk)

## @polymathnetwork/polymesh-sdk

## Getting Started

### Purpose

The Polymesh SDK's main goal is to provide external developers with a set of tools that will allow them to build powerful applications that interact with the Polymesh protocol. It focuses on abstracting away all the complexities of the Polymesh blockchain and expose a simple but complete interface. The result is a feature-rich, user-friendly node.js library.

### Before moving on

This document assumes you are already familiar with [Security Tokens](https://thesecuritytokenstandard.org/) in general and [Polymath](https://www.polymath.network/) as well as [Polymesh](https://polymath.network/polymesh) in particular.

### Technical Pre-requisites

In order to use the Polymath SDK, you must install [node](https://nodejs.org/) \(version 10\) and [npm](https://www.npmjs.com/). The library is written in [typescript](https://www.typescriptlang.org/), but can also be used in plain javascript. This document will assume you are using typescript, but the translation to javascript is very simple.

### How to use

#### Installation

`npm i @polymathnetwork/polymesh-sdk --save`

Or, if you're using yarn

`yarn add @polymathnetwork/polymesh-sdk`

#### Initializing the client

Before you can start registering Tickers and creating Security Tokens, you have to connect the Polymesh SDK client to a Polymesh node. This is a pretty straightforward process:

```typescript
import { Polymesh } from '@polymathnetwork/polymesh-sdk';

async function run() {
  const polyClient = await Polymesh.connect({
    nodeUrl: 'https://some-node-url.com',
    accountSeed: 'YOUWISH',
  });

  // do stuff with the client
}
```

Here is an overview of the parameters passed to the `connect` function:

- `nodeUrl` is a URL that points to a running Polymesh node
- `accountSeed` is the seed (akin to a private key) of the account that will be performing transactions

**NOTE:** if using the SDK on a browser environment \(i.e. with the Polymesh wallet browser extension\), there is no need to provide the account seed. Instead, you pass a Keyring object that contains the address, and a signer for that address (which you would typically get from the wallet extension)

```typescript
import { Polymesh, Keyring } from '@polymathnetwork/polymesh-sdk';

async function run() {
  const keyring = new Keyring();
  keyring.addFromAddress(accountAddress);
  const signer = getSignerFromExtension(); // this is not an existing function, how you get this depends on the extension

  const polyClient = await Polymesh.connect({
    nodeUrl: 'https://some-node-url.com',
    keyring,
    signer,
  });

  // do stuff with the client
}
```
