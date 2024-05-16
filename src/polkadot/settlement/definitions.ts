/* eslint-disable @typescript-eslint/naming-convention */
export default {
  rpc: {
    getExecuteInstructionInfo: {
      description:
        'Returns an ExecuteInstructionInfo instance, containing the consumed weight and the number of tokens in the instruction.',
      params: [
        {
          name: 'instructionId',
          type: 'InstructionId',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'ExecuteInstructionInfo',
    },
    getAffirmationCount: {
      description:
        'Returns an instance of AffirmationCount, which holds the asset count for both the sender and receiver and the number of offchain assets in the instruction',
      params: [
        {
          name: 'instruction_id',
          type: 'InstructionId',
          isOptional: false,
        },
        {
          name: 'portfolios',
          type: 'Vec<PortfolioId>',
          isOptional: false,
        },
        {
          name: 'blockHash',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'AffirmationCount',
    },
    getTransferReport: {
      description:
        "Returns a vector containing all errors for the transfer. An empty vec means there's no error.",
      params: [
        {
          name: 'leg',
          type: 'Leg',
        },
        {
          name: 'skip_locked_check',
          type: 'bool',
        },
      ],
      type: 'Vec<DispatchError>',
    },
    getExecuteInstructionReport: {
      description:
        "Returns a vector containing all errors for the execution. An empty vec means there's no error.",
      params: [
        {
          name: 'instruction_id',
          type: 'InstructionId',
        },
      ],
      type: 'Vec<DispatchError>',
    },
  },
  types: {},
};
