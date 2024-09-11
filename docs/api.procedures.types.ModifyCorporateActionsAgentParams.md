# Interface: ModifyCorporateActionsAgentParams

[api/procedures/types](../wiki/api.procedures.types).ModifyCorporateActionsAgentParams

## Table of contents

### Properties

- [requestExpiry](../wiki/api.procedures.types.ModifyCorporateActionsAgentParams#requestexpiry)
- [target](../wiki/api.procedures.types.ModifyCorporateActionsAgentParams#target)

## Properties

### requestExpiry

• `Optional` **requestExpiry**: `Date`

date at which the authorization request to modify the Corporate Actions Agent expires (optional, never expires if a date is not provided)

#### Defined in

[api/procedures/types.ts:1155](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1155)

___

### target

• **target**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity to be set as Corporate Actions Agent

#### Defined in

[api/procedures/types.ts:1151](https://github.com/PolymeshAssociation/polymesh-sdk/blob/fe2e6dd1/src/api/procedures/types.ts#L1151)
