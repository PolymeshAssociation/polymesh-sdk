# Interface: CheckPermissionsResult<Type\>

[types](../wiki/types).CheckPermissionsResult

Result of a `checkPermissions` call. If `Type` is `Account`, represents whether the Account
  has all the necessary secondary key Permissions. If `Type` is `Identity`, represents whether the
  Identity has all the necessary external agent Permissions

## Type parameters

| Name | Type |
| :------ | :------ |
| `Type` | extends [`SignerType`](../wiki/types.SignerType) |

## Table of contents

### Properties

- [message](../wiki/types.CheckPermissionsResult#message)
- [missingPermissions](../wiki/types.CheckPermissionsResult#missingpermissions)
- [result](../wiki/types.CheckPermissionsResult#result)

## Properties

### message

• `Optional` **message**: `string`

optional message explaining the reason for failure in special cases

#### Defined in

[types/index.ts:1064](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1064)

___

### missingPermissions

• `Optional` **missingPermissions**: `Type` extends [`Account`](../wiki/types.SignerType#account) ? [`SimplePermissions`](../wiki/types.SimplePermissions) : ``null`` \| [`TxTag`](../wiki/generated.types#txtag)[]

required permissions which the signer *DOESN'T* have. Only present if `result` is `false`

#### Defined in

[types/index.ts:1056](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1056)

___

### result

• **result**: `boolean`

whether the signer complies with the required permissions or not

#### Defined in

[types/index.ts:1060](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/types/index.ts#L1060)
