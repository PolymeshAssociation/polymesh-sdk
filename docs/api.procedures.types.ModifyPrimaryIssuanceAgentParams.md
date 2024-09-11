# Interface: ModifyPrimaryIssuanceAgentParams

[api/procedures/types](../wiki/api.procedures.types).ModifyPrimaryIssuanceAgentParams

## Table of contents

### Properties

- [requestExpiry](../wiki/api.procedures.types.ModifyPrimaryIssuanceAgentParams#requestexpiry)
- [target](../wiki/api.procedures.types.ModifyPrimaryIssuanceAgentParams#target)

## Properties

### requestExpiry

• `Optional` **requestExpiry**: `Date`

date at which the authorization request to modify the primary issuance agent expires (optional, never expires if a date is not provided)

#### Defined in

[api/procedures/types.ts:1055](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1055)

___

### target

• **target**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity to be set as primary issuance agent

#### Defined in

[api/procedures/types.ts:1051](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1051)
