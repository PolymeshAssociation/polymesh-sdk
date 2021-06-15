/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    getPortfolios: {
      description: 'Gets all user-defined portfolio names of an identity',
      params: [
        {
          name: 'did',
          type: 'IdentityId',
          isOptional: false,
        },
      ],
      type: 'GetPortfoliosResult',
    },
    getPortfolioAssets: {
      description: 'Gets the balances of all assets in a given portfolio',
      params: [
        {
          name: 'portfolio_id',
          type: 'PortfolioId',
          isOptional: false,
        },
      ],
      type: 'GetPortfolioAssetsResult',
    },
  },
  types: {},
};
