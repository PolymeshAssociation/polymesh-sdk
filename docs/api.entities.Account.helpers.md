[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/helpers

# api/entities/Account/helpers

## Functions

### getMissingPortfolioPermissions()

> **getMissingPortfolioPermissions**(`requiredPermissions`, `currentPermissions`): ([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[] \| `null` \| `undefined`

Defined in: [api/entities/Account/helpers.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/1473bc3749248826a69330d9fc1dbaf67202c736/src/api/entities/Account/helpers.ts#L30)

Calculate the difference between the required Transaction permissions and the current ones

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `requiredPermissions` | ([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[] \| `null` \| `undefined` |
| `currentPermissions` | [`SectionPermissions`](../wiki/api.entities.types#sectionpermissions)\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\> \| `null` |

#### Returns

([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[] \| `null` \| `undefined`
