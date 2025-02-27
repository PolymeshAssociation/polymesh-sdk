import BigNumber from 'bignumber.js';

import { Ballots } from '~/api/entities/Asset/Fungible/CorporateActions/Ballots';
import { Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
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
});
