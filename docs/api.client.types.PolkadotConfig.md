# Interface: PolkadotConfig

[api/client/types](../wiki/api.client.types).PolkadotConfig

## Table of contents

### Properties

- [metadata](../wiki/api.client.types.PolkadotConfig#metadata)
- [noInitWarn](../wiki/api.client.types.PolkadotConfig#noinitwarn)
- [typesBundle](../wiki/api.client.types.PolkadotConfig#typesbundle)

## Properties

### metadata

• `Optional` **metadata**: `Record`\<`string`, \`0x$\{string}\`\>

provide a locally saved metadata file for a modestly fast startup time (e.g. 1 second when provided, 1.5 seconds without).

**`Note`**

if not provided the SDK will read the needed data from chain during startup

**`Note`**

format is key as genesis hash and spec version and the value hex encoded chain metadata

**`Example`**

creating valid metadata
```ts
const meta = _polkadotApi.runtimeMetadata.toHex();
const genesisHash = _polkadotApi.genesisHash;
const specVersion = _polkadotApi.runtimeVersion.specVersion;

const metadata = {
 [`${genesisHash}-${specVersion}`]: meta,
};
```

#### Defined in

[api/client/types.ts:152](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L152)

___

### noInitWarn

• `Optional` **noInitWarn**: `boolean`

set to `true` to disable polkadot start up warnings

#### Defined in

[api/client/types.ts:157](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L157)

___

### typesBundle

• `Optional` **typesBundle**: `OverrideBundleType`

allows for types to be provided for multiple chain specs at once

**`Note`**

shouldn't be needed for most use cases

#### Defined in

[api/client/types.ts:164](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/client/types.ts#L164)
