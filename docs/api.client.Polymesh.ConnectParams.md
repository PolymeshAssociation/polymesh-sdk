# Interface: ConnectParams

[api/client/Polymesh](../wiki/api.client.Polymesh).ConnectParams

## Table of contents

### Properties

- [middlewareV2](../wiki/api.client.Polymesh.ConnectParams#middlewarev2)
- [nodeUrl](../wiki/api.client.Polymesh.ConnectParams#nodeurl)
- [polkadot](../wiki/api.client.Polymesh.ConnectParams#polkadot)
- [signingManager](../wiki/api.client.Polymesh.ConnectParams#signingmanager)

## Properties

### middlewareV2

• `Optional` **middlewareV2**: [`MiddlewareConfig`](../wiki/api.client.types.MiddlewareConfig)

Allows for historical data to be queried. Required for some methods to work

#### Defined in

[api/client/Polymesh.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Polymesh.ts#L52)

___

### nodeUrl

• **nodeUrl**: `string`

The websocket or http URL for the Polymesh node to connect to

**`Note`**

subscription features are not available if an http URL is provided

#### Defined in

[api/client/Polymesh.ts:44](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Polymesh.ts#L44)

___

### polkadot

• `Optional` **polkadot**: [`PolkadotConfig`](../wiki/api.client.types.PolkadotConfig)

Advanced options that will be used with the underling polkadot.js instance

#### Defined in

[api/client/Polymesh.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Polymesh.ts#L56)

___

### signingManager

• `Optional` **signingManager**: `SigningManager`

Handles signing of transactions. Required to be set before submitting transactions

#### Defined in

[api/client/Polymesh.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/client/Polymesh.ts#L48)
