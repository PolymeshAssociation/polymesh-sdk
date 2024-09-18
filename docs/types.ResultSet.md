# Interface: ResultSet<T\>

[types](../wiki/types).ResultSet

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [count](../wiki/types.ResultSet#count)
- [data](../wiki/types.ResultSet#data)
- [next](../wiki/types.ResultSet#next)

## Properties

### count

• `Optional` **count**: `BigNumber`

**`Note`**

 methods will have `count` defined when middleware is configured, but be undefined otherwise. This happens when the chain node is queried directly

#### Defined in

[types/index.ts:789](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L789)

___

### data

• **data**: `T`[]

#### Defined in

[types/index.ts:784](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L784)

___

### next

• **next**: [`NextKey`](../wiki/types#nextkey)

#### Defined in

[types/index.ts:785](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L785)
