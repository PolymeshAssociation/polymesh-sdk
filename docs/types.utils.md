[@polymeshassociation/polymesh-sdk](../wiki/README) / types/utils

# types/utils

## Type Aliases

### ArgsType

> **ArgsType**\<`T`\> = `T` *extends* (...`args`) => `unknown` ? `A` : `never`

Defined in: [types/utils/index.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L29)

Less strict version of `Parameters<T>`

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

### Ensured

> **Ensured**\<`T`, `K`\> = `Required`\<`Pick`\<`T`, `K`\>\> & `{ [SubKey in K]: NonNullable<T[SubKey]> }`

Defined in: [types/utils/index.ts:87](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L87)

Pick a single property from T and ensure it is defined

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |

***

### HumanReadableType

> **HumanReadableType**\<`T`\> = `T` *extends* [`Entity`](../wiki/api.entities.Entity#abstract-entity)\<`unknown`, infer H\> ? [`HumanReadableType`](../wiki/#humanreadabletype)\<`H`\> : `T` *extends* `BigNumber` ? `string` : `T` *extends* `Date` ? `string` : `T` *extends* `object` ? `{ [K in keyof T]: T[K] extends Entity<unknown, infer E> ? HumanReadableType<E> : HumanReadableType<T[K]> }` : `T`

Defined in: [types/utils/index.ts:35](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L35)

Recursively traverse a type and transform its Entity properties into their
  human readable version (as if `.toHuman` had been called on all of them)

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

### Modify

> **Modify**\<`T`, `R`\> = `Omit`\<`T`, keyof `R`\> & `R`

Defined in: [types/utils/index.ts:76](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L76)

Override T with the properties of R

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `R` |

***

### PaginatedQueryArgs

> **PaginatedQueryArgs**\<`T`\> = `T` & `object`

Defined in: [types/utils/index.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L91)

#### Type Declaration

##### size?

> `optional` **size?**: `number`

##### start?

> `optional` **start?**: `number`

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

### QueryArgs

> **QueryArgs**\<`T`, `K`\> = `{ [P in K]?: T[P] }`

Defined in: [types/utils/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L96)

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |

***

### WithRequired

> **WithRequired**\<`T`, `K`\> = `T` & `{ [P in K]-?: T[P] }`

Defined in: [types/utils/index.ts:82](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/types/utils/index.ts#L82)

Ensure a specific property of T is defined

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `K` *extends* keyof `T` |
