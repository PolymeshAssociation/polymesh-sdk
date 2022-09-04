import { u64 } from '@polkadot/types';
import { PolymeshPrimitivesTicker } from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Metadata } from '~/api/entities/Asset/Metadata';
import { Asset, Context, MetadataEntry, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MetadataType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset',
  require('~/testUtils/mocks/entities').mockAssetModule('~/api/entities/Asset')
);
jest.mock(
  '~/api/entities/MetadataEntry',
  require('~/testUtils/mocks/entities').mockMetadataEntryModule('~/api/entities/MetadataEntry')
);
jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('Metadata class', () => {
  let ticker: string;
  let asset: Asset;
  let context: Context;
  let metadata: Metadata;
  let rawTicker: PolymeshPrimitivesTicker;
  let stringToTickerStub: sinon.SinonStub;

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');

    ticker = 'SOME_TICKER';
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getAssetInstance({ ticker });

    metadata = new Metadata(asset, context);

    rawTicker = dsMockUtils.createMockTicker(ticker);
    stringToTickerStub.withArgs(ticker, context).returns(rawTicker);
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
    expect(Metadata.prototype instanceof Namespace).toBe(true);
  });

  describe('method: register', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<MetadataEntry>;
      const params = { name: 'SOME_METADATA', specs: {} };

      procedureMockUtils
        .getPrepareStub()
        .withArgs({ args: { ticker, ...params }, transformer: undefined }, context)
        .resolves(expectedTransaction);

      const tx = await metadata.register(params);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: get', () => {
    let ids: BigNumber[];
    let rawIds: u64[];
    let u64ToBigNumberStub: sinon.SinonStub;

    beforeAll(() => {
      u64ToBigNumberStub = sinon.stub(utilsConversionModule, 'u64ToBigNumber');
    });

    beforeEach(() => {
      ids = [new BigNumber(1), new BigNumber(2)];
      rawIds = [dsMockUtils.createMockU64(ids[0]), dsMockUtils.createMockU64(ids[1])];

      rawIds.forEach((rawId, index) => u64ToBigNumberStub.withArgs(rawId).returns(ids[index]));

      dsMockUtils.createQueryStub('asset', 'assetMetadataGlobalKeyToName', {
        entries: [
          tuple(
            [rawIds[0]],
            dsMockUtils.createMockOption(dsMockUtils.createMockBytes('GLOBAL_NAME'))
          ),
        ],
      });

      dsMockUtils.createQueryStub('asset', 'assetMetadataLocalKeyToName', {
        entries: rawIds.map((rawId, index) =>
          tuple(
            [rawTicker, rawId],
            dsMockUtils.createMockOption(dsMockUtils.createMockBytes(`LOCAL_NAME_${index}`))
          )
        ),
      });
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should return all MetadataEntry associated to the Asset', async () => {
      const result = await metadata.get();

      expect(result).toEqual([
        expect.objectContaining({
          id: new BigNumber(1),
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Global,
        }),
        expect.objectContaining({
          id: new BigNumber(1),
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        }),
        expect.objectContaining({
          id: new BigNumber(2),
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        }),
      ]);
    });
  });

  describe('method: getOne', () => {
    let id: BigNumber;

    beforeAll(() => {
      sinon.stub(utilsConversionModule, 'bigNumberToU64');
    });

    beforeEach(() => {
      id = new BigNumber(1);
    });

    afterAll(() => {
      sinon.restore();
    });

    it('should throw an error if no MetadataEntry is found', async () => {
      dsMockUtils.createQueryStub('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });
      await expect(metadata.getOne({ id, type: MetadataType.Global })).rejects.toThrow(
        `There is no global Asset Metadata with id "${id.toString()}"`
      );

      dsMockUtils.createQueryStub('asset', 'assetMetadataLocalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });
      await expect(metadata.getOne({ id, type: MetadataType.Local })).rejects.toThrow(
        `There is no local Asset Metadata with id "${id.toString()}"`
      );
    });

    it('should MetadataEntry for requested id and type', async () => {
      const rawName = dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_NAME'));
      dsMockUtils.createQueryStub('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: rawName,
      });

      let result = await metadata.getOne({ id, type: MetadataType.Global });
      expect(result).toEqual(
        expect.objectContaining({
          id,
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Global,
        })
      );

      dsMockUtils.createQueryStub('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });

      dsMockUtils.createQueryStub('asset', 'assetMetadataLocalKeyToName', {
        returnValue: rawName,
      });

      result = await metadata.getOne({ id, type: MetadataType.Local });
      expect(result).toEqual(
        expect.objectContaining({
          id,
          asset: expect.objectContaining({ ticker }),
          type: MetadataType.Local,
        })
      );
    });
  });
});
