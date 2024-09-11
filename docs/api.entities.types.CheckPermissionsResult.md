# Interface: CheckPermissionsResult\<Type\>

[api/entities/types](../wiki/api.entities.types).CheckPermissionsResult

Result of a `checkPermissions` call. If `Type` is `Account`, represents whether the Account
  has all the necessary secondary key Permissions. If `Type` is `Identity`, represents whether the
  Identity has all the necessary external agent Permissions

## Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | extends [`SignerType`](../wiki/api.entities.types.SignerType) |

## Table of contents

### Properties

- [message](../wiki/api.entities.types.CheckPermissionsResult#message)
- [missingPermissions](../wiki/api.entities.types.CheckPermissionsResult#missingpermissions)
- [result](../wiki/api.entities.types.CheckPermissionsResult#result)

## Properties

### message

• `Optional` **message**: `string`

optional message explaining the reason for failure in special cases

#### Defined in

[api/entities/types.ts:721](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L721)

___

### missingPermissions

• `Optional` **missingPermissions**: `Type` extends [`Account`](../wiki/api.entities.types.SignerType#account) ? [`SimplePermissions`](../wiki/api.entities.types.SimplePermissions) : ``null`` \| [`TxTag`](../wiki/generated.types#txtag)[]

required permissions which the signer *DOESN'T* have. Only present if `result` is `false`

#### Defined in

[api/entities/types.ts:713](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L713)

___

### result

• **result**: `boolean`

whether the signer complies with the required permissions or not

#### Defined in

[api/entities/types.ts:717](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L717)
