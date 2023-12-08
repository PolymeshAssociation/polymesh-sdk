# Interface: SettlementLeg

[api/entities/Portfolio/types](../wiki/api.entities.Portfolio.types).SettlementLeg

## Hierarchy

- [`Leg`](../wiki/api.entities.Instruction.types.Leg)

  ↳ **`SettlementLeg`**

## Table of contents

### Properties

- [amount](../wiki/api.entities.Portfolio.types.SettlementLeg#amount)
- [asset](../wiki/api.entities.Portfolio.types.SettlementLeg#asset)
- [direction](../wiki/api.entities.Portfolio.types.SettlementLeg#direction)
- [from](../wiki/api.entities.Portfolio.types.SettlementLeg#from)
- [to](../wiki/api.entities.Portfolio.types.SettlementLeg#to)

## Properties

### amount

• **amount**: `BigNumber`

#### Inherited from

[Leg](../wiki/api.entities.Instruction.types.Leg).[amount](../wiki/api.entities.Instruction.types.Leg#amount)

#### Defined in

[api/entities/Instruction/types.ts:49](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L49)

___

### asset

• **asset**: [`Asset`](../wiki/api.entities.Asset.Asset)

#### Inherited from

[Leg](../wiki/api.entities.Instruction.types.Leg).[asset](../wiki/api.entities.Instruction.types.Leg#asset)

#### Defined in

[api/entities/Instruction/types.ts:50](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L50)

___

### direction

• **direction**: [`SettlementDirectionEnum`](../wiki/types.SettlementDirectionEnum)

#### Defined in

[api/entities/Portfolio/types.ts:13](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Portfolio/types.ts#L13)

___

### from

• **from**: [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

#### Inherited from

[Leg](../wiki/api.entities.Instruction.types.Leg).[from](../wiki/api.entities.Instruction.types.Leg#from)

#### Defined in

[api/entities/Instruction/types.ts:47](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L47)

___

### to

• **to**: [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)

#### Inherited from

[Leg](../wiki/api.entities.Instruction.types.Leg).[to](../wiki/api.entities.Instruction.types.Leg#to)

#### Defined in

[api/entities/Instruction/types.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2d3ac2ae/src/api/entities/Instruction/types.ts#L48)
