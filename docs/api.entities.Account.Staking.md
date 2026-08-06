[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/Staking

# api/entities/Account/Staking

## Classes

### Staking

Defined in: [api/entities/Account/Staking/index.ts:26](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L26)

Handles Account staking related functionality

#### Extends

- `Namespace`\<[`Account`](../wiki/api.entities.Account#account)\>

#### Methods

##### getCommission()

> **getCommission**(): `Promise`\<[`StakingCommission`](../wiki/api.entities.Account.types#stakingcommission) \| `null`\>

Defined in: [api/entities/Account/Staking/index.ts:252](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L252)

Fetch the commission settings for this validator account

###### Returns

`Promise`\<[`StakingCommission`](../wiki/api.entities.Account.types#stakingcommission) \| `null`\>

The commission details or null if the account is not seeking nominations as a validator

##### getController()

###### Call Signature

> **getController**(): `Promise`\<[`Account`](../wiki/api.entities.Account#account) \| `null`\>

Defined in: [api/entities/Account/Staking/index.ts:193](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L193)

Fetch the controller associated to this account if there is one

###### Returns

`Promise`\<[`Account`](../wiki/api.entities.Account#account) \| `null`\>

The controller account or null if the account is not a stash

###### Note

a stash can be its own controller

###### Call Signature

> **getController**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Account/Staking/index.ts:204](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L204)

Fetch the controller associated to this account if there is one

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`Account`](../wiki/api.entities.Account#account) \| `null`\> | Callback function that can be used to listen for changes to the controller |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

The controller account or null if the account is not a stash

###### Note

can be subscribed to, if connected to node using a web socket

###### Note

a stash can be its own controller

##### getLedger()

> **getLedger**(): `Promise`\<[`StakingLedger`](../wiki/api.entities.Account.types#stakingledger) \| `null`\>

Defined in: [api/entities/Account/Staking/index.ts:32](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L32)

Fetch the ledger information for a stash account

###### Returns

`Promise`\<[`StakingLedger`](../wiki/api.entities.Account.types#stakingledger) \| `null`\>

The staking ledger information or null if the account is not a controller

##### getNomination()

###### Call Signature

> **getNomination**(): `Promise`\<[`StakingNomination`](../wiki/api.entities.Account.types#stakingnomination) \| `null`\>

Defined in: [api/entities/Account/Staking/index.ts:133](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L133)

Fetch this account's current nominations

###### Returns

`Promise`\<[`StakingNomination`](../wiki/api.entities.Account.types#stakingnomination) \| `null`\>

The nomination details or null if the account is not a controller

###### Call Signature

> **getNomination**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Account/Staking/index.ts:143](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L143)

Fetch this account's current nominations

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`StakingNomination`](../wiki/api.entities.Account.types#stakingnomination) \| `null`\> | Callback function that can be used to listen for changes to the nominations |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

The nomination details or null if the account is not a controller

###### Note

can be subscribed to, if connected to node using a web socket

##### getPayee()

###### Call Signature

> **getPayee**(): `Promise`\<[`StakingPayee`](../wiki/api.entities.Account.types#stakingpayee) \| `null`\>

Defined in: [api/entities/Account/Staking/index.ts:56](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L56)

Fetch the payee that will receive a stash account's rewards

###### Returns

`Promise`\<[`StakingPayee`](../wiki/api.entities.Account.types#stakingpayee) \| `null`\>

The payee account or null if the account is not a stash

###### Call Signature

> **getPayee**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Account/Staking/index.ts:66](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/Staking/index.ts#L66)

Fetch the payee that will receive a stash account's rewards

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`StakingPayee`](../wiki/api.entities.Account.types#stakingpayee) \| `null`\> | Callback function that can be used to listen for changes to the staking payee |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

The payee account or null if the account is not a stash

###### Note

can be subscribed to, if connected to node using a web socket
