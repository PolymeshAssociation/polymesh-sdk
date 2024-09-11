# Enumeration: PayingAccountType

[base/types](../wiki/base.types).PayingAccountType

Type of relationship between a paying account and a beneficiary

## Table of contents

### Enumeration Members

- [Caller](../wiki/base.types.PayingAccountType#caller)
- [Other](../wiki/base.types.PayingAccountType#other)
- [Subsidy](../wiki/base.types.PayingAccountType#subsidy)

## Enumeration Members

### Caller

• **Caller** = ``"Caller"``

the caller Account is responsible of paying the fees

#### Defined in

[base/types.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L127)

___

### Other

• **Other** = ``"Other"``

the paying Account is paying for a specific transaction because of
  chain-specific constraints (e.g. the caller is accepting an invitation to an Identity
  and cannot have any funds to pay for it by definition)

#### Defined in

[base/types.ts:123](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L123)

___

### Subsidy

• **Subsidy** = ``"Subsidy"``

the paying Account is currently subsidizing the caller

#### Defined in

[base/types.ts:117](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/base/types.ts#L117)
