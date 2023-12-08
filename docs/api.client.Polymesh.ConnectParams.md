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

• `Optional` **middlewareV2**: [`MiddlewareConfig`](../wiki/types.MiddlewareConfig)

Allows for historical data to be queried. Required for some methods to work

#### Defined in

[api/client/Polymesh.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L47)

___

### nodeUrl

• **nodeUrl**: `string`

The websocket URL for the Polymesh node to connect to

#### Defined in

[api/client/Polymesh.ts:39](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L39)

___

### polkadot

• `Optional` **polkadot**: [`PolkadotConfig`](../wiki/types.PolkadotConfig)

Advanced options that will be used with the underling polkadot.js instance

#### Defined in

[api/client/Polymesh.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L51)

___

### signingManager

• `Optional` **signingManager**: `SigningManager`

Handles signing of transactions. Required to be set before submitting transactions

#### Defined in

[api/client/Polymesh.ts:43](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/client/Polymesh.ts#L43)
