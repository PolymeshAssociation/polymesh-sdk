# Enumeration: PermissionGroupType

[api/entities/types](../wiki/api.entities.types).PermissionGroupType

## Table of contents

### Enumeration Members

- [ExceptMeta](../wiki/api.entities.types.PermissionGroupType#exceptmeta)
- [Full](../wiki/api.entities.types.PermissionGroupType#full)
- [PolymeshV1Caa](../wiki/api.entities.types.PermissionGroupType#polymeshv1caa)
- [PolymeshV1Pia](../wiki/api.entities.types.PermissionGroupType#polymeshv1pia)

## Enumeration Members

### ExceptMeta

• **ExceptMeta** = ``"ExceptMeta"``

not authorized:
  - externalAgents

#### Defined in

[api/entities/types.ts:741](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L741)

___

### Full

• **Full** = ``"Full"``

all transactions authorized

#### Defined in

[api/entities/types.ts:736](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L736)

___

### PolymeshV1Caa

• **PolymeshV1Caa** = ``"PolymeshV1Caa"``

authorized:
  - corporateAction
  - corporateBallot
  - capitalDistribution

#### Defined in

[api/entities/types.ts:748](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L748)

___

### PolymeshV1Pia

• **PolymeshV1Pia** = ``"PolymeshV1Pia"``

authorized:
  - asset.issue
  - asset.redeem
  - asset.controllerTransfer
  - sto (except for sto.invest)

#### Defined in

[api/entities/types.ts:756](https://github.com/PolymeshAssociation/polymesh-sdk/blob/9a8715021/src/api/entities/types.ts#L756)
