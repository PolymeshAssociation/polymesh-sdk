# Module: api/entities/Account/helpers

## Table of contents

### Functions

- [getMissingPortfolioPermissions](../wiki/api.entities.Account.helpers#getmissingportfoliopermissions)

## Functions

### getMissingPortfolioPermissions

▸ **getMissingPortfolioPermissions**(`requiredPermissions`, `currentPermissions`): [`SimplePermissions`](../wiki/api.entities.types.SimplePermissions)[``"portfolios"``]

Calculate the difference between the required Transaction permissions and the current ones

#### Parameters

| Name | Type |
| :------ | :------ |
| `requiredPermissions` | `undefined` \| ``null`` \| ([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[] |
| `currentPermissions` | ``null`` \| [`SectionPermissions`](../wiki/api.entities.types.SectionPermissions)\<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\> |

#### Returns

[`SimplePermissions`](../wiki/api.entities.types.SimplePermissions)[``"portfolios"``]

#### Defined in

[api/entities/Account/helpers.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/654b99c8/src/api/entities/Account/helpers.ts#L30)
