# Module: api/entities/Account/helpers

## Table of contents

### Functions

- [getMissingPortfolioPermissions](../wiki/api.entities.Account.helpers#getmissingportfoliopermissions)

## Functions

### getMissingPortfolioPermissions

▸ **getMissingPortfolioPermissions**(`requiredPermissions`, `currentPermissions`): [`SimplePermissions`](../wiki/types.SimplePermissions)[``"portfolios"``]

Calculate the difference between the required Transaction permissions and the current ones

#### Parameters

| Name | Type |
| :------ | :------ |
| `requiredPermissions` | `undefined` \| ``null`` \| ([`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio))[] |
| `currentPermissions` | ``null`` \| [`SectionPermissions`](../wiki/types.SectionPermissions)<[`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio.NumberedPortfolio) \| [`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio.DefaultPortfolio)\> |

#### Returns

[`SimplePermissions`](../wiki/types.SimplePermissions)[``"portfolios"``]
