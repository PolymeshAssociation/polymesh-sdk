import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import { Context, CustomPermissionGroup, PermissionGroup } from '~/internal';
import { dsMockUtils, entityMockUtils } from '~/testUtils/mocks';
import * as utilsConversionModule from '~/utils/conversion';

describe('CustomPermissionGroup class', () => {
  const ticker = 'TOKENNAME';

  let context: Context;

  beforeAll(() => {
    dsMockUtils.initMocks();
    entityMockUtils.initMocks();
  });

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    entityMockUtils.cleanup();
  });

  test('should extend PermissionGroup', () => {
    expect(CustomPermissionGroup.prototype instanceof PermissionGroup).toBe(true);
  });

  describe('constructor', () => {
    test('should assign id to instance', () => {
      const id = new BigNumber(1);
      const customPermissionGroup = new CustomPermissionGroup({ id, ticker }, context);

      expect(customPermissionGroup.id).toBe(id);
      expect(customPermissionGroup.ticker).toBe(ticker);
    });
  });

  describe('method: isUniqueIdentifiers', () => {
    test('should return true if the object conforms to the interface', () => {
      expect(CustomPermissionGroup.isUniqueIdentifiers({ id: new BigNumber(1), ticker })).toBe(
        true
      );
      expect(CustomPermissionGroup.isUniqueIdentifiers({})).toBe(false);
      expect(CustomPermissionGroup.isUniqueIdentifiers({ id: 1 })).toBe(false);
    });
  });

  describe('method: toJson', () => {
    test('should return a human readable version of the entity', () => {
      const id = new BigNumber(1);
      const customPermissionGroup = new CustomPermissionGroup({ id, ticker }, context);
      expect(customPermissionGroup.toJson()).toEqual({
        id,
        ticker,
      });
    });
  });

  describe('method: getPermissions', () => {
    test('should return a list of permissions and transaction groups', async () => {
      const id = new BigNumber(1);
      const customPermissionGroup = new CustomPermissionGroup({ id, ticker }, context);

      sinon.stub(utilsConversionModule, 'stringToTicker');
      sinon.stub(utilsConversionModule, 'numberToU32');

      dsMockUtils.createQueryStub('externalAgents', 'groupPermissions', {
        returnValue: dsMockUtils.createMockOption(
          dsMockUtils.createMockExtrinsicPermissions({
            These: [
              /* eslint-disable @typescript-eslint/naming-convention */
              dsMockUtils.createMockPalletPermissions({
                pallet_name: dsMockUtils.createMockPalletName('Sto'),
                dispatchable_names: dsMockUtils.createMockDispatchableNames({
                  These: [dsMockUtils.createMockDispatchableName('invest')],
                }),
              }),
              dsMockUtils.createMockPalletPermissions({
                pallet_name: dsMockUtils.createMockPalletName('Identity'),
                dispatchable_names: dsMockUtils.createMockDispatchableNames({
                  These: [dsMockUtils.createMockDispatchableName('add_claim')],
                }),
              }),
              /* eslint-enable @typescript-eslint/naming-convention */
            ],
          })
        ),
      });

      const result = await customPermissionGroup.getPermissions();

      expect(result).toEqual({
        transactions: { type: 'Include', values: ['sto.invest', 'identity.addClaim'] },
        transactionGroups: [],
      });
    });
  });
});
