import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, MetadataEntry, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { MetadataLockStatus, MetadataSpec, MetadataType, MetadataValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('MetadataEntry class', () => {
  let context: Context;
  const ticker = 'SOME_TICKER';
  const id = new BigNumber(1);
  const type = MetadataType.Local;
  let metadataEntry: MetadataEntry;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'stringToTicker').mockImplementation();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    metadataEntry = new MetadataEntry({ id, ticker, type }, context);
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

  it('should extend Entity', () => {
    expect(MetadataEntry.prototype instanceof Entity).toBe(true);
  });

  describe('constructor', () => {
    it('should assign ticker, type and id to instance', () => {
      expect(metadataEntry).toEqual(
        expect.objectContaining({
          id,
          type,
          asset: expect.objectContaining({ ticker }),
        })
      );
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        MetadataEntry.isUniqueIdentifiers({
          id: new BigNumber(1),
          ticker: 'SOME_TICKER',
          type: MetadataType.Local,
        })
      ).toBe(true);
      expect(MetadataEntry.isUniqueIdentifiers({})).toBe(false);
      expect(MetadataEntry.isUniqueIdentifiers({ id: 2 })).toBe(false);
      expect(MetadataEntry.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 3 })).toBe(false);
      expect(
        MetadataEntry.isUniqueIdentifiers({ id: new BigNumber(1), ticker: 3, type: 'Random' })
      ).toBe(false);
    });
  });

  describe('method: set', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<MetadataEntry>;

      const params = { value: 'SOME_VALUE' };

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { metadataEntry, ...params }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await metadataEntry.set(params);

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: clear', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<MetadataEntry>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { metadataEntry }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await metadataEntry.clear();

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: details', () => {
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the name and specs of MetadataEntry', async () => {
      jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockImplementation();

      const rawName = dsMockUtils.createMockOption(dsMockUtils.createMockBytes('SOME_NAME'));
      const rawSpecs = dsMockUtils.createMockOption(dsMockUtils.createMockAssetMetadataSpec());
      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: rawName,
      });
      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalSpecs', {
        returnValue: rawSpecs,
      });

      const fakeSpecs: MetadataSpec = { url: 'SOME_URL' };
      when(jest.spyOn(utilsConversionModule, 'meshMetadataSpecToMetadataSpec'))
        .calledWith(rawSpecs)
        .mockReturnValue(fakeSpecs);

      let result = await metadataEntry.details();

      expect(result).toEqual({
        name: 'SOME_NAME',
        specs: fakeSpecs,
      });

      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: null,
      });
      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalSpecs', {
        returnValue: null,
      });

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: rawName,
      });
      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalSpecs', {
        returnValue: rawSpecs,
      });

      const globalMetadataEntry = new MetadataEntry(
        { ticker, id, type: MetadataType.Global },
        context
      );
      result = await globalMetadataEntry.details();
      expect(result).toEqual({
        name: 'SOME_NAME',
        specs: fakeSpecs,
      });
    });
  });

  describe('method: value', () => {
    it('should return the value and its details of the MetadataEntry', async () => {
      jest.spyOn(utilsConversionModule, 'metadataToMeshMetadataKey').mockImplementation();
      dsMockUtils.createQueryMock('asset', 'assetMetadataValues');
      dsMockUtils.createQueryMock('asset', 'assetMetadataValueDetails');

      const meshMetadataValueToMetadataValueSpy = jest.spyOn(
        utilsConversionModule,
        'meshMetadataValueToMetadataValue'
      );

      meshMetadataValueToMetadataValueSpy.mockReturnValue(null);

      let result = await metadataEntry.value();

      expect(result).toBeNull();

      const fakeResult: MetadataValue = {
        value: 'SOME_VALUE',
        lockStatus: MetadataLockStatus.Unlocked,
        expiry: new Date('2030/01/01'),
      };
      meshMetadataValueToMetadataValueSpy.mockReturnValue(fakeResult);

      result = await metadataEntry.value();

      expect(result).toEqual(fakeResult);
    });
  });

  describe('method: exists', () => {
    it('should return whether the MetadataEntry exists', async () => {
      const result = await metadataEntry.exists();
      expect(result).toBe(true);
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(metadataEntry.toHuman()).toEqual({
        id: '1',
        ticker: 'SOME_TICKER',
        type: 'Local',
      });
    });
  });
});
