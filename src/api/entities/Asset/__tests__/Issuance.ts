import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Asset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';

import { Issuance } from '../Issuance';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Issuance class', () => {
  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    entityMockUtils.reset();
    dsMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Issuance.prototype instanceof Namespace).toBe(true);
  });

  describe('method: issue', () => {
    afterAll(() => {
      sinon.restore();
    });

    it('should prepare the procedure with the correct arguments and context, and return the resulting transaction', async () => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getAssetInstance();
      const issuance = new Issuance(asset, context);

      const args = {
        ticker: asset.ticker,
        amount: new BigNumber(100),
      };

      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<Asset>;

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await issuance.issue(args);

      expect(tx).toBe(expectedTransaction);
    });
  });
});
