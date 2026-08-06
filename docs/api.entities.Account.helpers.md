[@polymeshassociation/polymesh-sdk](../wiki/README) / api/entities/Account/helpers

# api/entities/Account/helpers

## Functions

### getMissingPortfolioPermissions()

> **getMissingPortfolioPermissions**(`requiredPermissions`, `currentPermissions`): ([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[] \| `null` \| `undefined`

Defined in: [api/entities/Account/helpers.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/2fe0cba4cc5d1c342310555a6f23b51fd3fb9701/src/api/entities/Account/helpers.ts#L30)

Calculate the difference between the required Transaction permissions and the current ones

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `requiredPermissions` | ([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[] \| `null` \| `undefined` |
| `currentPermissions` | [`SectionPermissions`](../wiki/api.entities.types#sectionpermissions)\<[`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio)\> \| `null` |

#### Returns

([`DefaultPortfolio`](../wiki/api.entities.DefaultPortfolio#defaultportfolio) \| [`NumberedPortfolio`](../wiki/api.entities.NumberedPortfolio#numberedportfolio))[] \| `null` \| `undefined`
