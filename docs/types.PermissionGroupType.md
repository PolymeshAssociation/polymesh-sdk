# Enumeration: PermissionGroupType

[types](../wiki/types).PermissionGroupType

## Table of contents

### Enumeration Members

- [ExceptMeta](../wiki/types.PermissionGroupType#exceptmeta)
- [Full](../wiki/types.PermissionGroupType#full)
- [PolymeshV1Caa](../wiki/types.PermissionGroupType#polymeshv1caa)
- [PolymeshV1Pia](../wiki/types.PermissionGroupType#polymeshv1pia)

## Enumeration Members

### ExceptMeta

• **ExceptMeta** = ``"ExceptMeta"``

not authorized:
  - externalAgents

#### Defined in

[types/index.ts:1114](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1114)

___

### Full

• **Full** = ``"Full"``

all transactions authorized

#### Defined in

[types/index.ts:1109](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1109)

___

### PolymeshV1Caa

• **PolymeshV1Caa** = ``"PolymeshV1Caa"``

authorized:
  - corporateAction
  - corporateBallot
  - capitalDistribution

#### Defined in

[types/index.ts:1121](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1121)

___

### PolymeshV1Pia

• **PolymeshV1Pia** = ``"PolymeshV1Pia"``

authorized:
  - asset.issue
  - asset.redeem
  - asset.controllerTransfer
  - sto (except for sto.invest)

#### Defined in

[types/index.ts:1129](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L1129)
