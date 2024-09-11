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

[api/entities/types.ts:733](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L733)

___

### Full

• **Full** = ``"Full"``

all transactions authorized

#### Defined in

[api/entities/types.ts:728](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L728)

___

### PolymeshV1Caa

• **PolymeshV1Caa** = ``"PolymeshV1Caa"``

authorized:
  - corporateAction
  - corporateBallot
  - capitalDistribution

#### Defined in

[api/entities/types.ts:740](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L740)

___

### PolymeshV1Pia

• **PolymeshV1Pia** = ``"PolymeshV1Pia"``

authorized:
  - asset.issue
  - asset.redeem
  - asset.controllerTransfer
  - sto (except for sto.invest)

#### Defined in

[api/entities/types.ts:748](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/entities/types.ts#L748)
