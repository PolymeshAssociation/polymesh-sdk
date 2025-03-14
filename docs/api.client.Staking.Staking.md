# Class: Staking

[api/client/Staking](../wiki/api.client.Staking).Staking

Handles Staking related functionality

## Table of contents

### Methods

- [bond](../wiki/api.client.Staking.Staking#bond)
- [bondExtra](../wiki/api.client.Staking.Staking#bondextra)
- [eraInfo](../wiki/api.client.Staking.Staking#erainfo)
- [getValidators](../wiki/api.client.Staking.Staking#getvalidators)
- [nominate](../wiki/api.client.Staking.Staking#nominate)
- [setController](../wiki/api.client.Staking.Staking#setcontroller)
- [setPayee](../wiki/api.client.Staking.Staking#setpayee)
- [unbond](../wiki/api.client.Staking.Staking#unbond)
- [withdraw](../wiki/api.client.Staking.Staking#withdraw)

## Methods

### bond

▸ **bond**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Bond POLYX for staking

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`BondPolyxParams`](../wiki/api.procedures.types.BondPolyxParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

the signing account cannot be a stash

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [bond.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:112](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L112)

___

### bondExtra

▸ **bondExtra**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Bond extra POLYX for staking

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`UpdatePolyxBondParams`](../wiki/api.procedures.types.UpdatePolyxBondParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this transaction must be signed by a stash

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [bondExtra.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:124](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L124)

___

### eraInfo

▸ **eraInfo**(): `Promise`\<[`StakingEraInfo`](../wiki/api.client.types.StakingEraInfo)\>

Retrieve the current staking era

#### Returns

`Promise`\<[`StakingEraInfo`](../wiki/api.client.types.StakingEraInfo)\>

**`Note`**

can be subscribed to, if connected to node using a web socket

#### Defined in

[api/client/Staking.ts:239](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L239)

▸ **eraInfo**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`StakingEraInfo`](../wiki/api.client.types.StakingEraInfo)\> |

#### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

#### Defined in

[api/client/Staking.ts:240](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L240)

___

### getValidators

▸ **getValidators**(`paginationOpts?`): `Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`StakingCommission`](../wiki/api.entities.Account.types.StakingCommission)\>\>

Return information about nomination targets

#### Parameters

| Name | Type |
| :------ | :------ |
| `paginationOpts?` | [`PaginationOptions`](../wiki/api.entities.types.PaginationOptions) |

#### Returns

`Promise`\<[`ResultSet`](../wiki/api.entities.types.ResultSet)\<[`StakingCommission`](../wiki/api.entities.Account.types.StakingCommission)\>\>

**`Note`**

supports pagination

#### Defined in

[api/client/Staking.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L191)

___

### nominate

▸ **nominate**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Nominate validators for the bonded POLYX

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`NominateValidatorsParams`](../wiki/api.procedures.types.NominateValidatorsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this transaction must be signed by a controller

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [nominate.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:158](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L158)

___

### setController

▸ **setController**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Allow for a stash account to update its controller

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetStakingControllerParams`](../wiki/api.procedures.types.SetStakingControllerParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

the transaction must be signed by a stash account

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [setController.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:170](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L170)

___

### setPayee

▸ **setPayee**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Allow for a stash account to update where it's staking rewards are deposited

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`SetStakingPayeeParams`](../wiki/api.procedures.types.SetStakingPayeeParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

the transaction must be signed by a controller account

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [setPayee.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:182](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L182)

___

### unbond

▸ **unbond**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Unbond POLYX for staking. The unbonded amount can be withdrawn after the lockup period

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`UpdatePolyxBondParams`](../wiki/api.procedures.types.UpdatePolyxBondParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [unbond.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L134)

___

### withdraw

▸ **withdraw**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Withdraw unbonded POLYX to free it for the stash account

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this transaction must be signed by a controller

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [withdraw.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/client/Staking.ts:146](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/client/Staking.ts#L146)
