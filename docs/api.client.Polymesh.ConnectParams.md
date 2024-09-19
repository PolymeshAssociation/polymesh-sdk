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

[api/client/Polymesh.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Polymesh.ts#L51)

___

### nodeUrl

• **nodeUrl**: `string`

The websocket or http URL for the Polymesh node to connect to

**`Note`**

subscription features are not available if an http URL is provided

#### Defined in

[api/client/Polymesh.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Polymesh.ts#L43)

___

### polkadot

• `Optional` **polkadot**: [`PolkadotConfig`](../wiki/api.client.types.PolkadotConfig)

Advanced options that will be used with the underling polkadot.js instance

#### Defined in

[api/client/Polymesh.ts:55](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Polymesh.ts#L55)

___

### signingManager

• `Optional` **signingManager**: `SigningManager`

Handles signing of transactions. Required to be set before submitting transactions

#### Defined in

[api/client/Polymesh.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/88db4a91/src/api/client/Polymesh.ts#L47)
