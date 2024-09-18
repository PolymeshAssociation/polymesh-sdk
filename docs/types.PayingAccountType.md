# Enumeration: PayingAccountType

[types](../wiki/types).PayingAccountType

Type of relationship between a paying account and a beneficiary

## Table of contents

### Enumeration Members

- [Caller](../wiki/types.PayingAccountType#caller)
- [Other](../wiki/types.PayingAccountType#other)
- [Subsidy](../wiki/types.PayingAccountType#subsidy)

## Enumeration Members

### Caller

• **Caller** = ``"Caller"``

the caller Account is responsible of paying the fees

#### Defined in

[types/index.ts:829](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L829)

___

### Other

• **Other** = ``"Other"``

the paying Account is paying for a specific transaction because of
  chain-specific constraints (e.g. the caller is accepting an invitation to an Identity
  and cannot have any funds to pay for it by definition)

#### Defined in

[types/index.ts:825](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L825)

___

### Subsidy

• **Subsidy** = ``"Subsidy"``

the paying Account is currently subsidizing the caller

#### Defined in

[types/index.ts:819](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/types/index.ts#L819)
