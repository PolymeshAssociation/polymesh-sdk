import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { Context, Entity, MetadataEntry, PolymeshError, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { ErrorCode, MetadataLockStatus, MetadataSpec, MetadataType, MetadataValue } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('MetadataEntry class', () => {
  let context: Context;
  const assetId = '12341234-1234-1234-1234-123412341234';
  const id = new BigNumber(1);
  const type = MetadataType.Local;
  let metadataEntry: MetadataEntry;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
    procedureMockUtils.initMocks();

    jest.spyOn(utilsConversionModule, 'stringToAssetId').mockImplementation();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    metadataEntry = new MetadataEntry({ id, assetId, type }, context);
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
    it('should assign assetId, type and id to instance', () => {
      expect(metadataEntry).toEqual(
        expect.objectContaining({
          id,
          type,
          asset: expect.objectContaining({ id: assetId }),
        })
      );
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    it('should return true if the object conforms to the interface', () => {
      expect(
        MetadataEntry.isUniqueIdentifiers({
          id: new BigNumber(1),
          assetId: '12341234-1234-1234-1234-123412341234',
          type: MetadataType.Local,
        })
      ).toBe(true);
      expect(MetadataEntry.isUniqueIdentifiers({})).toBe(false);
      expect(MetadataEntry.isUniqueIdentifiers({ id: 2 })).toBe(false);
      expect(MetadataEntry.isUniqueIdentifiers({ id: new BigNumber(1), assetId: 3 })).toBe(false);
      expect(
        MetadataEntry.isUniqueIdentifiers({ id: new BigNumber(1), assetId: 3, type: 'Random' })
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

  describe('method: remove', () => {
    it('should prepare the procedure and return the resulting transaction', async () => {
      const expectedTransaction =
        'someTransaction' as unknown as PolymeshTransaction<MetadataEntry>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith({ args: { metadataEntry }, transformer: undefined }, context, {})
        .mockResolvedValue(expectedTransaction);

      const tx = await metadataEntry.remove();

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
        { assetId, id, type: MetadataType.Global },
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
    beforeAll(() => {
      jest.spyOn(utilsConversionModule, 'bigNumberToU64').mockImplementation();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return whether a global Metadata Entry exists', async () => {
      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });

      metadataEntry = new MetadataEntry({ id, assetId, type: MetadataType.Global }, context);

      await expect(metadataEntry.exists()).resolves.toBeFalsy();

      dsMockUtils.createQueryMock('asset', 'assetMetadataGlobalKeyToName', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes('someName')),
      });
      await expect(metadataEntry.exists()).resolves.toBeTruthy();
    });

    it('should return whether a local Metadata Entry exists', async () => {
      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: dsMockUtils.createMockOption(),
      });
      await expect(metadataEntry.exists()).resolves.toBeFalsy();

      dsMockUtils.createQueryMock('asset', 'assetMetadataLocalKeyToName', {
        returnValue: dsMockUtils.createMockOption(dsMockUtils.createMockBytes('someName')),
      });
      await expect(metadataEntry.exists()).resolves.toBeTruthy();
    });
  });

  describe('method: isModifiable', () => {
    let existsSpy: jest.SpyInstance;
    let valueSpy: jest.SpyInstance;

    beforeEach(() => {
      existsSpy = jest.spyOn(metadataEntry, 'exists');
      valueSpy = jest.spyOn(metadataEntry, 'value');
    });

    it('should return canModify as true if MetadataEntry exists and can be modified', async () => {
      existsSpy.mockResolvedValue(true);
      valueSpy.mockResolvedValue(null);
      const result = await metadataEntry.isModifiable();

      expect(result).toEqual({
        canModify: true,
      });
    });

    it('should return canModify as false along with the reason if the MetadataEntry does not exists', async () => {
      existsSpy.mockResolvedValue(false);
      valueSpy.mockResolvedValue(null);
      const error = new PolymeshError({
        code: ErrorCode.DataUnavailable,
        message: 'Metadata does not exists for the Asset',
        data: {
          assetId,
          type,
          id,
        },
      });
      const result = await metadataEntry.isModifiable();

      expect(result).toEqual({
        canModify: false,
        reason: error,
      });
    });

    it('should return canModify as false along with the reason if the MetadataEntry status is Locked', async () => {
      existsSpy.mockResolvedValue(true);
      valueSpy.mockResolvedValue({
        value: 'SOME_VALUE',
        expiry: null,
        lockStatus: MetadataLockStatus.Locked,
      });

      const error = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Metadata is locked and cannot be modified',
      });

      const result = await metadataEntry.isModifiable();

      expect(result).toEqual({
        canModify: false,
        reason: error,
      });
    });

    it('should return canModify as false along with the reason if the MetadataEntry is still in locked phase', async () => {
      existsSpy.mockResolvedValue(true);
      const lockedUntil = new Date('2099/01/01');
      valueSpy.mockResolvedValue({
        value: 'SOME_VALUE',
        expiry: null,
        lockStatus: MetadataLockStatus.LockedUntil,
        lockedUntil,
      });

      const error = new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Metadata is currently locked',
        data: {
          lockedUntil,
        },
      });

      const result = await metadataEntry.isModifiable();

      expect(result).toEqual({
        canModify: false,
        reason: error,
      });
    });
  });

  describe('method: toHuman', () => {
    it('should return a human readable version of the entity', () => {
      expect(metadataEntry.toHuman()).toEqual({
        id: '1',
        assetId: '12341234-1234-1234-1234-123412341234',
        ticker: '12341234-1234-1234-1234-123412341234',
        type: 'Local',
      });
    });
  });
});
