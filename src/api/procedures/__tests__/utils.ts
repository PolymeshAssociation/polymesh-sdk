import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import {
  assertInstructionValid,
  assertPortfolioExists,
  assertSecondaryKeys,
} from '~/api/procedures/utils';
import { Context, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import { getInstructionInstance } from '~/testUtils/mocks/entities';
import { Mocked } from '~/testUtils/types';
import { InstructionDetails, InstructionStatus, InstructionType, Signer } from '~/types';
import { SignerType, SignerValue } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/NumberedPortfolio',
  require('~/testUtils/mocks/entities').mockNumberedPortfolioModule(
    '~/api/entities/NumberedPortfolio'
  )
);

// NOTE uncomment in Governance v2 upgrade

// jest.mock(
//   '~/api/entities/Proposal',
//   require('~/testUtils/mocks/entities').mockProposalModule('~/api/entities/Proposal')
// );

// describe('assertProposalUnlocked', () => {
//   const pipId = new BigNumber(10);
//   const mockAddress = 'someAddress';
//   const details = ({
//     transaction: 'someModule.someMethod',
//   } as unknown) as ProposalDetails;

//   let mockContext: Mocked<Context>;

//   beforeAll(() => {
//     dsMockUtils.initMocks({
//       contextOptions: {
//         currentPairAddress: mockAddress,
//       },
//     });
//     entityMockUtils.initMocks();
//   });

//   beforeEach(() => {
//     mockContext = dsMockUtils.getContextInstance();
//   });

//   afterEach(() => {
//     entityMockUtils.reset();
//     dsMockUtils.reset();
//   });

//   afterAll(() => {
//     entityMockUtils.cleanup();
//     dsMockUtils.cleanup();
//   });

//   test('should throw an error if the proposal is not in pending state', async () => {
//     entityMockUtils.configureMocks({
//       proposalOptions: {
//         getDetails: {
//           ...details,
//           lastState: ProposalState.Killed,
//         },
//       },
//     });

//     let error;
//     try {
//       await assertProposalUnlocked(pipId, mockContext);
//     } catch (err) {
//       error = err;
//     }

//     expect(error.message).toBe('The proposal must be in pending state');
//   });

//   test('should throw an error if the proposal is not in the cool off period', async () => {
//     entityMockUtils.configureMocks({
//       proposalOptions: {
//         getDetails: {
//           ...details,
//           lastState: ProposalState.Pending,
//         },
//         getStage: ProposalStage.Open,
//       },
//     });

//     let error;
//     try {
//       await assertProposalUnlocked(pipId, mockContext);
//     } catch (err) {
//       error = err;
//     }

//     expect(error.message).toBe('The proposal must be in its cool-off period');
//   });

//   test('should not throw an error if the proposal is unlocked', async () => {
//     entityMockUtils.configureMocks({
//       proposalOptions: {
//         getDetails: {
//           ...details,
//           lastState: ProposalState.Pending,
//         },
//         getStage: ProposalStage.CoolOff,
//       },
//     });

//     const result = await assertProposalUnlocked(pipId, mockContext);

//     expect(result).toBeUndefined();
//   });
// });

describe('assertInstructionValid', () => {
  const latestBlock = new BigNumber(100);
  let mockContext: Mocked<Context>;
  let instruction: Instruction;

  beforeAll(() => {
    dsMockUtils.initMocks({
      contextOptions: {
        latestBlock,
      },
    });
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    entityMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  test('should throw an error if instruction is not in pending state', async () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Unknown,
        } as InstructionDetails,
      },
    });

    instruction = getInstructionInstance();

    return expect(assertInstructionValid(instruction, mockContext)).rejects.toThrow(
      'The Instruction must be in pending state'
    );
  });

  test('should throw an error if the instruction can not be modified', async () => {
    const endBlock = new BigNumber(10);

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          tradeDate: new Date('10/10/2010'),
          endBlock,
        } as InstructionDetails,
      },
    });

    instruction = getInstructionInstance();

    let error;

    try {
      await assertInstructionValid(instruction, mockContext);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The instruction cannot be modified; it has already reached its end block'
    );
    expect(error.data.currentBlock).toBe(latestBlock);
    expect(error.data.endBlock).toEqual(endBlock);
  });

  test('should not throw an error', async () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnAffirmation,
        } as InstructionDetails,
      },
    });

    instruction = getInstructionInstance();

    let result = await assertInstructionValid(instruction, mockContext);

    expect(result).toBeUndefined();

    entityMockUtils.configureMocks({
      instructionOptions: {
        details: {
          status: InstructionStatus.Pending,
          type: InstructionType.SettleOnBlock,
          endBlock: new BigNumber(1000000),
        } as InstructionDetails,
      },
    });

    instruction = getInstructionInstance();

    result = await assertInstructionValid(instruction, mockContext);

    expect(result).toBeUndefined();
  });
});

describe('assertPortfolioExists', () => {
  test("should throw an error if the portfolio doesn't exist", async () => {
    entityMockUtils.configureMocks({ numberedPortfolioOptions: { exists: false } });

    const context = dsMockUtils.getContextInstance();

    let error;
    try {
      await assertPortfolioExists({ did: 'someDid', number: new BigNumber(10) }, context);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe("The Portfolio doesn't exist");
  });

  test('should not throw an error if the portfolio exists', async () => {
    entityMockUtils.configureMocks({ numberedPortfolioOptions: { exists: true } });

    const context = dsMockUtils.getContextInstance();

    let error;
    try {
      await assertPortfolioExists({ did: 'someDid', number: new BigNumber(10) }, context);
      await assertPortfolioExists({ did: 'someDid' }, context);
    } catch (err) {
      error = err;
    }

    expect(error).toBeUndefined();
  });
});

describe('assertSecondaryKeys', () => {
  let signerToSignerValueStub: sinon.SinonStub<[Signer], SignerValue>;

  beforeAll(() => {
    signerToSignerValueStub = sinon.stub(utilsConversionModule, 'signerToSignerValue');
  });

  test('should not throw an error if all signers are secondary keys', async () => {
    const address = 'someAddress';
    const secondaryKeys = [
      {
        signer: entityMockUtils.getAccountInstance({ address }),
        permissions: {
          tokens: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];
    const signerValues = [{ type: SignerType.Account, value: address }];

    signerToSignerValueStub.returns(signerValues[0]);

    const result = assertSecondaryKeys(signerValues, secondaryKeys);
    expect(result).toBeUndefined();
  });

  test('should throw an error if one of the Signers is not a Secondary Key for the Identity', () => {
    const address = 'someAddress';
    const secondaryKeys = [
      {
        signer: entityMockUtils.getAccountInstance({ address }),
        permissions: {
          tokens: null,
          transactions: null,
          transactionGroups: [],
          portfolios: null,
        },
      },
    ];
    const signerValues = [{ type: SignerType.Account, value: 'otherAddress' }];

    signerToSignerValueStub.returns({ type: SignerType.Account, value: address });

    let error;

    try {
      assertSecondaryKeys(signerValues, secondaryKeys);
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('One of the Signers is not a Secondary Key for the Identity');
    expect(error.data.missing).toEqual([signerValues[0].value]);
  });
});
