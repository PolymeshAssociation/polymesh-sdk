# Interface: ResultSet\<T\>

[api/entities/types](../wiki/api.entities.types).ResultSet

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [count](../wiki/api.entities.types.ResultSet#count)
- [data](../wiki/api.entities.types.ResultSet#data)
- [next](../wiki/api.entities.types.ResultSet#next)

## Properties

### count

• `Optional` **count**: `BigNumber`

**`Note`**

methods will have `count` defined when middleware is configured, but be undefined otherwise. This happens when the chain node is queried directly

#### Defined in

[api/entities/types.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L100)

___

### data

• **data**: `T`[]

#### Defined in

[api/entities/types.ts:95](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L95)

___

### next

• **next**: [`NextKey`](../wiki/api.entities.types#nextkey)

#### Defined in

[api/entities/types.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L96)
