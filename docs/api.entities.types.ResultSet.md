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

[api/entities/types.ts:105](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L105)

___

### data

• **data**: `T`[]

#### Defined in

[api/entities/types.ts:100](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L100)

___

### next

• **next**: [`NextKey`](../wiki/api.entities.types#nextkey)

#### Defined in

[api/entities/types.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/entities/types.ts#L101)
