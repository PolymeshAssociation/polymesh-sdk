import BigNumber from 'bignumber.js';

import { Ballots } from '~/api/entities/Asset/Fungible/CorporateActions/Ballots';
import { Namespace, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MockCorporateBallot } from '~/testUtils/mocks/entities';
import { ErrorCode } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

describe('Ballots class', () => {
  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  beforeEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(Ballots.prototype instanceof Namespace).toBe(true);
  });

  describe('method: getOne', () => {
    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'stringToAssetId').mockImplementation();
      jest.spyOn(utilsConversionModule, 'bigNumberToU32').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the requested Ballot', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateAction({
            kind: 'Reorganization',
            targets: {
              identities: ['someDid'],
              treatment: 'Include',
            },
            /* eslint-disable @typescript-eslint/naming-convention */
            decl_date: new BigNumber(0),
            record_date: null,
            default_withholding_tax: new BigNumber(0),
            withholding_tax: [],
            /* eslint-enable @typescript-eslint/naming-convention */
          })
        ),
      });

      dsMockUtils.createQueryMock('corporateAction', 'details', {
        returnValue: dsMockUtils.createMockBytes('ballot details'),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockCorporateBallotMeta({
            title: 'Test Ballot',
            motions: [
              {
                title: 'Test Motion Title',
                infoLink: 'https://example.com',
                choices: ['Yes', 'No', 'Abstain'],
              },
            ],
          })
        ),
      });

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      const target = new Ballots(asset, context);

      const ballot = await target.getOne({ id });

      expect(ballot.id).toEqual(id);
      expect(ballot.asset.id).toBe(assetId);
    });

    it('should throw an error if the Ballot does not exist', async () => {
      const assetId = '12341234-1234-1234-1234-123412341234';
      const id = new BigNumber(1);

      dsMockUtils.createQueryMock('corporateAction', 'corporateActions', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryMock('corporateBallot', 'metas', {
        returnValue: dsMockUtils.createMockOption(),
      });

      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      const target = new Ballots(asset, context);

      await expect(target.getOne({ id })).rejects.toThrow('The Ballot does not exist');
    });
  });

  describe('method: get', () => {
    const assetId = '12341234-1234-1234-1234-123412341234';
    let target: Ballots;
    let mockBallot: MockCorporateBallot;

    beforeAll(() => {
      const context = dsMockUtils.getContextInstance();
      const asset = entityMockUtils.getFungibleAssetInstance({ assetId });
      jest.spyOn(utilsConversionModule, 'u32ToBigNumber').mockReturnValue(new BigNumber(2));

      mockBallot = entityMockUtils.getCorporateBallotInstance({ id: new BigNumber(0), assetId });
      target = new Ballots(asset, context);

      dsMockUtils.createQueryMock('corporateAction', 'caIdSequence', {
        returnValue: dsMockUtils.createMockU32(new BigNumber(2)),
      });

      jest.spyOn(target, 'getOne').mockImplementation(({ id }) => {
        if (id.isEqualTo(0)) {
          return Promise.resolve(mockBallot);
        } else if (id.isEqualTo(1)) {
          return Promise.reject(
            new PolymeshError({
              code: ErrorCode.DataUnavailable,
              message: 'The Ballot does not exist',
            })
          );
        }
        return Promise.reject(new Error('Unexpected id'));
      });
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return all existing Ballots for the Asset', async () => {
      const ballots = await target.get();

      expect(ballots.length).toBe(1);
      expect(ballots[0].id.isEqualTo(new BigNumber(0))).toBe(true);
      expect(ballots[0].asset.id).toBe(assetId);
    });
  });
});
