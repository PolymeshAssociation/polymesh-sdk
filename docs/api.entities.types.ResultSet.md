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

[api/entities/types.ts:98](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L98)

___

### data

• **data**: `T`[]

#### Defined in

[api/entities/types.ts:93](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L93)

___

### next

• **next**: [`NextKey`](../wiki/api.entities.types#nextkey)

#### Defined in

[api/entities/types.ts:94](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L94)
