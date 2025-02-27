import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, CorporateBallot } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('CorporateBallot class', () => {
  let context: Context;

  let id: BigNumber;
  let assetId: string;
  let corporateBallot: CorporateBallot;
  let getAssetIdForMiddlewareSpy: jest.SpyInstance;
  const mockBallotMeta = {
    title: 'Test Ballot',
    motions: [
      {
        title: 'Test Motion Title',
        infoLink: 'https://example.com',
        choices: ['Yes', 'No', 'Abstain'],
      },
    ],
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
    getAssetIdForMiddlewareSpy = jest.spyOn(utilsInternalModule, 'getAssetIdForMiddleware');
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();

    id = new BigNumber(1);
    assetId = '12341234-1234-1234-1234-123412341234';

    corporateBallot = new CorporateBallot(
      {
        id,
        assetId,
        meta: mockBallotMeta,
      },
      context
    );

    when(getAssetIdForMiddlewareSpy).calledWith(assetId, context).mockResolvedValue(assetId);
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

  describe('constructor', () => {
    it('should assign parameters to instance', () => {
      expect(corporateBallot.id).toEqual(id);
      expect(corporateBallot.asset.id).toBe(assetId);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(CorporateBallot.isUniqueIdentifiers({ assetId: 'SYMBOL', id: new BigNumber(1) })).toBe(
        true
      );
      expect(CorporateBallot.isUniqueIdentifiers({})).toBe(false);
      expect(CorporateBallot.isUniqueIdentifiers({ assetId: 'SYMBOL' })).toBe(false);
      expect(CorporateBallot.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: exists', () => {
    it('should return whether the Distribution exists', async () => {
      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateBallotMeta({ title: 'someTitle', motions: [] })
        ),
      });

      let result = await corporateBallot.exists();

      expect(result).toBe(true);

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(),
      });

      result = await corporateBallot.exists();

      expect(result).toBe(false);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(corporateBallot.toHuman()).toEqual({
        id: '1',
        assetId: '12341234-1234-1234-1234-123412341234',
        meta: mockBallotMeta,
      });
    });
  });
});
