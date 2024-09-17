/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    isIdentityHasValidCdd: {
      description: 'use to tell whether the given did has valid cdd claim or not',
      params: [
        {
          name: 'did',
          type: 'IdentityId',
          isOptional: false,
        },
        {
          name: 'buffer_time',
          type: 'u64',
          isOptional: true,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'CddStatus',
    },
    getAssetDid: {
      description: 'function is used to query the given ticker DID',
      params: [
        {
          name: 'ticker',
          type: 'Ticker',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'AssetDidResult',
    },
    getDidRecords: {
      description: 'Used to get the did record values for a given DID',
      params: [
        {
          name: 'did',
          type: 'IdentityId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'RpcDidRecords',
    },
    getDidStatus: {
      description: 'Retrieve status of the DID',
      params: [
        {
          name: 'did',
          type: 'Vec<IdentityId>',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<DidStatus>',
    },
    getFilteredAuthorizations: {
      description:
        'Retrieve authorizations data for a given signatory and filtered using the given authorization type',
      params: [
        {
          name: 'signatory',
          type: 'Signatory',
          isOptional: false,
        },
        {
          name: 'allow_expired',
          type: 'bool',
          isOptional: false,
        },
        {
          name: 'auth_type',
          type: 'AuthorizationType',
          isOptional: true,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<Authorization>',
    },
    getKeyIdentityData: {
      description: 'Query relation between a signing key and a DID',
      params: [
        {
          name: 'acc',
          type: 'AccountId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Option<KeyIdentityData>',
    },
    validCDDClaims: {
      description:
        'Returns all valid IdentityClaim of type CustomerDueDiligence for the given target_identity',
      params: [
        {
          name: 'target_identity',
          type: 'IdentityId',
          isOptional: false,
        },
        {
          name: 'cdd_checker_leeway',
          type: 'u64',
          isOptional: true,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<IdentityClaim>',
    },
  },
  types: {},
};
