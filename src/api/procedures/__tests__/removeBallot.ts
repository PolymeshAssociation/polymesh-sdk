import { PalletCorporateActionsCaId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareRemoveBallot,
  removeBallot,
} from '~/api/procedures/removeBallot';
import { Context, CorporateBallot, PolymeshError, Procedure } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { CorporateBallotParams, ErrorCode, FungibleAsset, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import * as utilsInternalModule from '~/utils/internal';

jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);
jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('removeBallot procedure', () => {
  const assetId = '12341234-1234-1234-1234-123412341234';
  const ballotId = new BigNumber(1);

  let asset: FungibleAsset;
  let ballot: CorporateBallot;
  let ballotDetails: CorporateBallotParams;

  let proc: Procedure<Params, void>;

  let rawCaId: PalletCorporateActionsCaId;
  let mockContext: Mocked<Context>;
  let removeBallotTransaction: PolymeshTx<unknown[]>;

  let corporateActionIdentifierToCaIdSpy: jest.SpyInstance;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    corporateActionIdentifierToCaIdSpy = jest.spyOn(
      utilsConversionModule,
      'corporateActionIdentifierToCaId'
    );

    asset = entityMockUtils.getFungibleAssetInstance({ assetId });

    ballotDetails = {
      startDate: new Date(new Date().getTime() + 500000),
      endDate: new Date(new Date().getTime() + 1000000),
      description: 'description',
      meta: {
        title: 'title',
        motions: [],
      },
      rcv: true,
      declarationDate: new Date(new Date().getTime() + 500000),
    };

    ballot = entityMockUtils.getCorporateBallotInstance({
      id: ballotId,
      assetId,
    });
  });

  beforeEach(() => {
    removeBallotTransaction = dsMockUtils.createTxMock('corporateAction', 'removeCa');
    mockContext = dsMockUtils.getContextInstance();
    proc = procedureMockUtils.getInstance<Params, void>(mockContext);
    rawCaId = dsMockUtils.createMockCAId({
      assetId,
      localId: ballotId,
    });

    when(corporateActionIdentifierToCaIdSpy)
      .calledWith(
        expect.objectContaining({
          asset,
          localId: ballotId,
        }),
        mockContext
      )
      .mockReturnValue(rawCaId);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should throw an error if ballot is not found', async () => {
    jest.spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow').mockRejectedValue(
      new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'The CorporateBallot does not exist',
        data: { id: ballot.id },
      })
    );

    return expect(
      prepareRemoveBallot.call(proc, {
        asset,
        ballot,
      })
    ).rejects.toThrow('The CorporateBallot does not exist');
  });

  it('should throw an error if the ballot has already started', async () => {
    ballot = entityMockUtils.getCorporateBallotInstance({
      id: ballotId,
      assetId,
    });

    return expect(
      prepareRemoveBallot.call(proc, {
        asset,
        ballot,
      })
    ).rejects.toThrow('The CorporateBallot does not exist');
  });

  it('should add a removeBallot transaction to the queue', async () => {
    jest
      .spyOn(utilsInternalModule, 'getCorporateBallotDetailsOrThrow')
      .mockResolvedValue(ballotDetails);

    let result = await prepareRemoveBallot.call(proc, {
      asset,
      ballot,
    });

    expect(result).toEqual({
      transaction: removeBallotTransaction,
      args: [rawCaId],
    });

    result = await prepareRemoveBallot.call(proc, {
      asset,
      ballot: ballotId,
    });

    expect(result).toEqual({
      transaction: removeBallotTransaction,
      args: [rawCaId],
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const boundFunc = getAuthorization.bind(proc);
      const args = {
        ballot,
        asset,
      } as Params;

      expect(boundFunc(args)).toEqual({
        permissions: {
          transactions: [TxTags.corporateAction.RemoveCa],
          assets: [asset],
          portfolios: [],
        },
      });
    });
  });

  describe('removeBallot', () => {
    it('should be instance of Procedure', async () => {
      expect(removeBallot()).toBeInstanceOf(Procedure);
    });
  });
});
