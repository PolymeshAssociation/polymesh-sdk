/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    complianceReport: {
      description: 'Checks all compliance requirements for the given ticker.',
      params: [
        {
          name: 'assetId',
          type: 'AssetId',
        },
        {
          name: 'sender_identity',
          type: 'IdentityId',
        },
        {
          name: 'receiver_identity',
          type: 'IdentityId',
        },
      ],
      type: 'Result<ComplianceReport, DispatchError>',
    },
  },
  types: {},
};
