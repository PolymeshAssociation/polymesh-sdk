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

[api/procedures/types.ts:1232](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1232)

___

### target

• **target**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity to be set as primary issuance agent

#### Defined in

[api/procedures/types.ts:1228](https://github.com/PolymeshAssociation/polymesh-sdk/blob/f8a937f04/src/api/procedures/types.ts#L1228)
