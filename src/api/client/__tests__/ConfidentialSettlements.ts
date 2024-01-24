import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { ConfidentialSettlements } from '~/api/client/ConfidentialSettlements';
import { Context, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ConfidentialVenue } from '~/types';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

jest.mock(
  '~/api/entities/confidential/ConfidentialVenue',
  require('~/testUtils/mocks/entities').mockConfidentialVenueModule(
    '~/api/entities/confidential/ConfidentialVenue'
  )
);

jest.mock(
  '~/api/entities/confidential/ConfidentialTransaction',
  require('~/testUtils/mocks/entities').mockConfidentialTransactionModule(
    '~/api/entities/confidential/ConfidentialTransaction'
  )
);

describe('ConfidentialSettlements Class', () => {
  let context: Mocked<Context>;
  let settlements: ConfidentialSettlements;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    settlements = new ConfidentialSettlements(context);
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  describe('method: createVenue', () => {
    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<ConfidentialVenue>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: undefined, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await settlements.createVenue();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getVenue', () => {
    it('should return a confidential Venue by its id', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        confidentialVenueOptions: { exists: true },
      });

      const result = await settlements.getVenue({ id: venueId });

      expect(result.id).toEqual(venueId);
    });

    it('should throw if the confidential Venue does not exist', async () => {
      const venueId = new BigNumber(1);

      entityMockUtils.configureMocks({
        confidentialVenueOptions: { exists: false },
      });

      return expect(settlements.getVenue({ id: venueId })).rejects.toThrow(
        'The confidential Venue does not exists'
      );
    });
  });

  describe('method: getInstruction', () => {
    it('should return an Instruction by its id', async () => {
      const transactionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        confidentialTransactionOptions: { exists: true },
      });

      const result = await settlements.getTransaction({ id: transactionId });

      expect(result.id).toEqual(transactionId);
    });

    it('should throw if the Instruction does not exist', async () => {
      const transactionId = new BigNumber(1);

      entityMockUtils.configureMocks({
        confidentialTransactionOptions: { exists: false },
      });

      return expect(settlements.getTransaction({ id: transactionId })).rejects.toThrow(
        'The Transaction does not exists'
      );
    });
  });
});
