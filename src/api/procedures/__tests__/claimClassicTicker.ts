import BigNumber from 'bignumber.js';
import { EcdsaSignature, Ticker } from 'polymesh-types/types';
import sinon from 'sinon';

import { prepareClaimClassicTicker } from '~/api/procedures/claimClassicTicker';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimClassicTickerParams, TickerReservation } from '~/types';
import { CLASSIC_TICKER_OWNER_DID } from '~/utils/constants';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/TickerReservation',
  require('~/testUtils/mocks/entities').mockTickerReservationModule(
    '~/api/entities/TickerReservation'
  )
);

describe('claimClassicTicker procedure', () => {
  let mockContext: Mocked<Context>;
  let ticker: string;
  let ethereumSignature: string;
  let ethereumAddress: string;
  let did: string;
  let rawTicker: Ticker;
  let rawEthereumSignature: EcdsaSignature;
  let addTransactionStub: sinon.SinonStub;
  let stringToTickerStub: sinon.SinonStub;
  let stringToEcdsaSignatureStub: sinon.SinonStub;

  beforeAll(() => {
    did = '0x0600000000000000000000000000000000000000000000000000000000000000';
    dsMockUtils.initMocks({ contextOptions: { did } });
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    ticker = 'SOME_TICKER';
    ethereumSignature =
      '0xce3f19a1aaaf04adfcd16fbc19ffd5d2d3117588a543dac2ff6befd2c6320b7c6ec586df0ec276775b6f53cb2dfc69f78efc2ef974e04cb269fe2e5d9546ea791c';
    ethereumAddress = '0xb710e549e2ac26ad77c3acc2bb7f6bb48d7e7c7f';

    stringToTickerStub = sinon.stub(utilsConversionModule, 'stringToTicker');
    stringToEcdsaSignatureStub = sinon.stub(utilsConversionModule, 'stringToEcdsaSignature');
  });

  beforeEach(() => {
    mockContext = dsMockUtils.getContextInstance();
    addTransactionStub = procedureMockUtils.getAddTransactionStub();
    rawTicker = dsMockUtils.createMockTicker(ticker);
    rawEthereumSignature = dsMockUtils.createMockEcdsaSignature(ethereumSignature);

    dsMockUtils.createQueryStub('asset', 'tickers', {
      returnValue: dsMockUtils.createMockTickerRegistration({
        owner: CLASSIC_TICKER_OWNER_DID,
        expiry: null,
      }),
    });
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockClassicTickerRegistration({
          ethOwner: ethereumAddress,
          isCreated: false,
        })
      ),
    });
    stringToTickerStub.withArgs(ticker, mockContext).returns(rawTicker);
    stringToEcdsaSignatureStub.withArgs(ethereumSignature).returns(rawEthereumSignature);
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

  it('should throw an error if the ticker is not in the reserved classic ticker list', () => {
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(),
    });

    const proc = procedureMockUtils.getInstance<ClaimClassicTickerParams, TickerReservation>(
      mockContext
    );

    return expect(
      prepareClaimClassicTicker.call(proc, { ticker, ethereumSignature })
    ).rejects.toThrow('The supplied ticker is not in the reserved classic ticker list');
  });

  it('should throw an error if the ticker reservation has expired', () => {
    dsMockUtils.createQueryStub('asset', 'tickers', {
      returnValue: dsMockUtils.createMockTickerRegistration({
        expiry: dsMockUtils.createMockOption(
          dsMockUtils.createMockMoment(new BigNumber(new Date('10/14/1987').getTime()))
        ),
        owner: CLASSIC_TICKER_OWNER_DID,
      }),
    });

    const proc = procedureMockUtils.getInstance<ClaimClassicTickerParams, TickerReservation>(
      mockContext
    );

    return expect(
      prepareClaimClassicTicker.call(proc, { ticker, ethereumSignature })
    ).rejects.toThrow("The Ticker's claiming period has already expired");
  });

  it('should throw an error if the ticker has already been claimed', () => {
    dsMockUtils.createQueryStub('asset', 'tickers', {
      returnValue: dsMockUtils.createMockTickerRegistration({
        expiry: null,
        owner: 'someDid',
      }),
    });

    const proc = procedureMockUtils.getInstance<ClaimClassicTickerParams, TickerReservation>(
      mockContext
    );

    return expect(
      prepareClaimClassicTicker.call(proc, { ticker, ethereumSignature })
    ).rejects.toThrow('Ticker already claimed');
  });

  it('should throw an error if the ethereum signature is not valid', async () => {
    const proc = procedureMockUtils.getInstance<ClaimClassicTickerParams, TickerReservation>(
      mockContext
    );

    let error;

    try {
      await prepareClaimClassicTicker.call(proc, { ticker, ethereumSignature: 'somethingInvalid' });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Ethereum signature not valid');
    expect(error.data).toEqual({
      error: 'Invalid signature length',
    });
  });

  it('should throw an error if the ethereum address that owns the ticker is not the same one that signed', async () => {
    dsMockUtils.createQueryStub('asset', 'classicTickers', {
      returnValue: dsMockUtils.createMockOption(
        dsMockUtils.createMockClassicTickerRegistration({
          ethOwner: 'notYou',
          isCreated: false,
        })
      ),
    });

    const proc = procedureMockUtils.getInstance<ClaimClassicTickerParams, TickerReservation>(
      mockContext
    );

    let error;

    try {
      await prepareClaimClassicTicker.call(proc, { ticker, ethereumSignature });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe(
      'The Account that signed the message is not the classic Ticker owner'
    );
    expect(error.data).toEqual({
      signerAddress: ethereumAddress,
    });
  });

  it('should add a claim classic ticker transaction to the queue', async () => {
    const transaction = dsMockUtils.createTxStub('asset', 'claimClassicTicker');
    const proc = procedureMockUtils.getInstance<ClaimClassicTickerParams, TickerReservation>(
      mockContext
    );

    await prepareClaimClassicTicker.call(proc, { ticker, ethereumSignature });

    sinon.assert.calledWith(addTransactionStub, {
      transaction,
      args: [rawTicker, rawEthereumSignature],
    });
  });
});
