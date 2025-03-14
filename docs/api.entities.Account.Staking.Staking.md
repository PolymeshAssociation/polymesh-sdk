# Class: Staking

[api/entities/Account/Staking](../wiki/api.entities.Account.Staking).Staking

Handles Account staking related functionality

## Hierarchy

- `Namespace`\<[`Account`](../wiki/api.entities.Account.Account)\>

  ↳ **`Staking`**

## Table of contents

### Methods

- [getCommission](../wiki/api.entities.Account.Staking.Staking#getcommission)
- [getController](../wiki/api.entities.Account.Staking.Staking#getcontroller)
- [getLedger](../wiki/api.entities.Account.Staking.Staking#getledger)
- [getNomination](../wiki/api.entities.Account.Staking.Staking#getnomination)
- [getPayee](../wiki/api.entities.Account.Staking.Staking#getpayee)

## Methods

### getCommission

▸ **getCommission**(): `Promise`\<``null`` \| [`StakingCommission`](../wiki/api.entities.Account.types.StakingCommission)\>

#### Returns

`Promise`\<``null`` \| [`StakingCommission`](../wiki/api.entities.Account.types.StakingCommission)\>

null unless the account is seeking nominations as a validator

#### Defined in

[api/entities/Account/Staking/index.ts:216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L216)

___

### getController

▸ **getController**(): `Promise`\<``null`` \| [`Account`](../wiki/api.entities.Account.Account)\>

Fetch the controller associated to this account if there is one

#### Returns

`Promise`\<``null`` \| [`Account`](../wiki/api.entities.Account.Account)\>

null unless the account is a stash

**`Note`**

can be subscribed to, if connected to node using a web socket

**`Note`**

a stash can be its own controller

#### Defined in

[api/entities/Account/Staking/index.ts:169](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L169)

▸ **getController**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| [`Account`](../wiki/api.entities.Account.Account)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Account/Staking/index.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L170)

___

### getLedger

▸ **getLedger**(): `Promise`\<``null`` \| [`StakingLedger`](../wiki/api.entities.Account.types.StakingLedger)\>

Fetch the ledger information for a stash account

#### Returns

`Promise`\<``null`` \| [`StakingLedger`](../wiki/api.entities.Account.types.StakingLedger)\>

null unless the account is a controller

#### Defined in

[api/entities/Account/Staking/index.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L32)

___

### getNomination

▸ **getNomination**(): `Promise`\<``null`` \| [`StakingNomination`](../wiki/api.entities.Account.types.StakingNomination)\>

Fetch this account's current nominations

#### Returns

`Promise`\<``null`` \| [`StakingNomination`](../wiki/api.entities.Account.types.StakingNomination)\>

null unless the account is a controller

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Account/Staking/index.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L117)

▸ **getNomination**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| [`StakingNomination`](../wiki/api.entities.Account.types.StakingNomination)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Account/Staking/index.ts:118](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L118)

___

### getPayee

▸ **getPayee**(): `Promise`\<``null`` \| [`StakingPayee`](../wiki/api.entities.Account.types.StakingPayee)\>

Fetch the payee that will receive a stash account's rewards

#### Returns

`Promise`\<``null`` \| [`StakingPayee`](../wiki/api.entities.Account.types.StakingPayee)\>

**`Note`**

null is returned when the account is not a stash

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/entities/Account/Staking/index.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L57)

▸ **getPayee**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<``null`` \| [`StakingPayee`](../wiki/api.entities.Account.types.StakingPayee)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/entities/Account/Staking/index.ts:58](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/Account/Staking/index.ts#L58)
