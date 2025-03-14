# Interface: CheckRolesResult

[api/entities/types](../wiki/api.entities.types).CheckRolesResult

Result of a `checkRoles` call

## Table of contents

### Properties

- [message](../wiki/api.entities.types.CheckRolesResult#message)
- [missingRoles](../wiki/api.entities.types.CheckRolesResult#missingroles)
- [result](../wiki/api.entities.types.CheckRolesResult#result)

## Properties

### message

• `Optional` **message**: `string`

optional message explaining the reason for failure in special cases

#### Defined in

[api/entities/types.ts:710](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L710)

___

### missingRoles

• `Optional` **missingRoles**: [`Role`](../wiki/api.procedures.types#role)[]

required roles which the Identity *DOESN'T* have. Only present if `result` is `false`

#### Defined in

[api/entities/types.ts:702](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L702)

___

### result

• **result**: `boolean`

whether the signer possesses all the required roles or not

#### Defined in

[api/entities/types.ts:706](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L706)
