import { u64 } from '@polkadot/types';
import { AccountId } from '@polkadot/types/interfaces';
import { PolymeshPrimitivesAssetAssetId } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

import { getAuthorization, Params, prepareSetNftApproval } from '~/api/procedures/setNftApproval';
import { Account, Context, Nft, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/NonFungible',
  require('~/testUtils/mocks/entities').mockNftModule('~/api/entities/Asset/NonFungible')
);
jest.mock(
  '~/api/entities/Account',
  require('~/testUtils/mocks/entities').mockAccountModule('~/api/entities/Account')
);

describe('setNftApproval procedure', () => {
  const holderAddress = 'holderAddress';
  const spenderAddress = 'spenderAddress';

  let mockContext: Mocked<Context>;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawNftId: u64;
  let rawSpender: AccountId;
  let holder: Account;

  const buildNft = (opts: {
    owner?: unknown;
    approval?: Account | null;
    isOperator?: boolean;
  }): Nft => {
    const nft = entityMockUtils.getNftInstance({
      assetId: '12341234-1234-1234-1234-123412341234',
      id: new BigNumber(1),
    }) as unknown as Nft & {
      getOwner: jest.Mock;
      getApproval: jest.Mock;
    };
    nft.getOwner = jest.fn().mockResolvedValue(opts.owner === undefined ? holder : opts.owner);
    nft.getApproval = jest.fn().mockResolvedValue(opts.approval ?? null);
    nft.collection.isOperatorApproved = jest.fn().mockResolvedValue(opts.isOperator ?? false);

    return nft;
  };

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    rawAssetId = dsMockUtils.createMockAssetId('0x12341234123412341234123412341234');
    rawNftId = dsMockUtils.createMockU64(new BigNumber(1));
    rawSpender = dsMockUtils.createMockAccountId(spenderAddress);
  });

  beforeEach(() => {
    holder = entityMockUtils.getAccountInstance({ address: holderAddress });
    mockContext = dsMockUtils.getContextInstance({ signingAddress: holderAddress });
    dsMockUtils.createTxMock('nft', 'approve');

    jest.spyOn(utilsConversionModule, 'assetToMeshAssetId').mockReturnValue(rawAssetId);
    jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockReturnValue(rawNftId);
    jest.spyOn(utilsConversionModule, 'stringToAccountId').mockReturnValue(rawSpender);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  it('should return a transaction spec approving the spender', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetNftApproval.call(proc, {
      nft: buildNft({}),
      spender: spenderAddress,
    });

    expect(result).toEqual({
      transaction: mockContext.polymeshApi.tx.nft.approve,
      args: [rawAssetId, rawNftId, rawSpender],
      resolver: undefined,
    });
  });

  it('should return a transaction spec clearing the approval', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetNftApproval.call(proc, {
      nft: buildNft({ approval: entityMockUtils.getAccountInstance({ address: spenderAddress }) }),
      spender: null,
    });

    expect(result.args).toEqual([rawAssetId, rawNftId, null]);
  });

  it("should let an operator approve for the NFT's holder", async () => {
    mockContext = dsMockUtils.getContextInstance({ signingAddress: 'operatorAddress' });
    dsMockUtils.createTxMock('nft', 'approve');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    const result = await prepareSetNftApproval.call(proc, {
      nft: buildNft({ isOperator: true }),
      spender: spenderAddress,
    });

    expect(result.transaction).toBe(mockContext.polymeshApi.tx.nft.approve);
  });

  it('should throw if the caller neither holds nor operates for the NFT', () => {
    mockContext = dsMockUtils.getContextInstance({ signingAddress: 'strangerAddress' });
    dsMockUtils.createTxMock('nft', 'approve');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareSetNftApproval.call(proc, { nft: buildNft({}), spender: spenderAddress })
    ).rejects.toThrow(
      new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message:
          "Only the NFT's holder, or an operator it has approved for the collection, can set the NFT's approval",
      })
    );
  });

  it('should throw if the NFT is held in a Portfolio', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareSetNftApproval.call(proc, {
        nft: buildNft({ owner: entityMockUtils.getDefaultPortfolioInstance() }),
        spender: spenderAddress,
      })
    ).rejects.toThrow(
      'Only an NFT held by an Account can be approved, and this one is held in a Portfolio'
    );
  });

  it('should throw if the NFT does not exist', () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareSetNftApproval.call(proc, { nft: buildNft({ owner: null }), spender: spenderAddress })
    ).rejects.toThrow('The NFT does not exist');
  });

  it('should throw if nothing would change', async () => {
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    await expect(
      prepareSetNftApproval.call(proc, {
        nft: buildNft({
          approval: entityMockUtils.getAccountInstance({ address: spenderAddress }),
        }),
        spender: spenderAddress,
      })
    ).rejects.toThrow('The Account is already approved for the NFT');

    await expect(
      prepareSetNftApproval.call(proc, { nft: buildNft({}), spender: null })
    ).rejects.toThrow('The NFT has no approval to clear');
  });

  it('should throw NotSupported on a chain without NFT approvals', () => {
    dsMockUtils.reset();
    mockContext = dsMockUtils.getContextInstance();
    dsMockUtils.createTxMock('nft', 'issueNft');
    const proc = procedureMockUtils.getInstance<Params, void>(mockContext);

    return expect(
      prepareSetNftApproval.call(proc, { nft: buildNft({}), spender: spenderAddress })
    ).rejects.toThrow(expect.objectContaining({ code: ErrorCode.NotSupported }));
  });

  describe('getAuthorization', () => {
    it('should require only the extrinsic permission', () => {
      expect(getAuthorization()).toEqual({
        permissions: {
          transactions: [TxTags.nft.Approve],
          assets: [],
          portfolios: [],
        },
      });
    });
  });
});
