[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Subsidies

# api/entities/Subsidies

## Classes

### Subsidies

Defined in: [api/entities/Subsidies.ts:8](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Subsidies.ts#L8)

Handles all Account Subsidies related functionality

#### Extends

- `Namespace`\<[`Account`](../wiki/api.entities.Account#account)\>

#### Methods

##### getBeneficiaries()

> **getBeneficiaries**(): `Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance)[]\>

Defined in: [api/entities/Subsidies.ts:12](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Subsidies.ts#L12)

Get the list of Subsidy relationship along with their subsidized amount for which this Account is the subsidizer

###### Returns

`Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance)[]\>

##### getPendingSubsidies()

> **getPendingSubsidies**(): `Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance)[]\>

Defined in: [api/entities/Subsidies.ts:92](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Subsidies.ts#L92)

Get pending subsidies (for which this Account is the beneficiary) that have been authorised but not yet accepted.

###### Returns

`Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance)[]\>

##### getSubsidizer()

###### Call Signature

> **getSubsidizer**(): `Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance) \| `null`\>

Defined in: [api/entities/Subsidies.ts:60](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Subsidies.ts#L60)

Get the Subsidy relationship along with the subsidized amount for this Account is the beneficiary.

###### Returns

`Promise`\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance) \| `null`\>

the Subsidy relationship, or null if this Account isn't being subsidized

###### Call Signature

> **getSubsidizer**(`callback`): `Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

Defined in: [api/entities/Subsidies.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Subsidies.ts#L70)

Get the Subsidy relationship along with the subsidized amount for this Account is the beneficiary.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | [`SubCallback`](../wiki/api.entities.types#subcallback)\<[`SubsidyWithAllowance`](../wiki/api.entities.Subsidy.types#subsidywithallowance) \| `null`\> | Callback function that can be used to listen for changes to the subsidy relationship |

###### Returns

`Promise`\<[`UnsubCallback`](../wiki/api.entities.types#unsubcallback)\>

the Subsidy relationship, or null if this Account isn't being subsidized

###### Note

can be subscribed to, if connected to node using a web socket
