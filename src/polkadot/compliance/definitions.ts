/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    canTransfer: {
      description:
        'Checks whether a transaction with given parameters is compliant to the compliance manager conditions',
      params: [
        {
          name: 'ticker',
          type: 'Ticker',
          isOptional: false,
        },
        {
          name: 'fromDid',
          type: 'Option<IdentityId>',
          isOptional: false,
        },
        {
          name: 'toDid',
          type: 'Option<IdentityId>',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'AssetComplianceResult',
    },
  },
  types: {},
};
