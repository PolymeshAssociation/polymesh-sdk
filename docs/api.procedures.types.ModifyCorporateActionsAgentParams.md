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

[api/procedures/types.ts:775](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L775)

___

### target

• **target**: `string` \| [`Identity`](../wiki/api.entities.Identity.Identity)

Identity to be set as Corporate Actions Agent

#### Defined in

[api/procedures/types.ts:771](https://github.com/PolymeshAssociation/polymesh-sdk/blob/079537ad/src/api/procedures/types.ts#L771)
