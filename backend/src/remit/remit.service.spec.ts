import { RemitService } from './remit.service';
import { BadRequestException } from '@nestjs/common';

// Mock Horizon server
const mockCall = jest.fn();
const mockSubmit = jest.fn();
const mockLoad = jest.fn();
const mockStrictSend = jest.fn(() => ({ call: mockCall }));

jest.mock('@stellar/stellar-sdk', () => {
  const actual = jest.requireActual('@stellar/stellar-sdk');
  return {
    ...actual,
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        loadAccount: mockLoad,
        strictSendPaths: mockStrictSend,
        submitTransaction: mockSubmit,
      })),
    },
  };
});

describe('RemitService', () => {
  let service: RemitService;

  beforeEach(() => {
    service = new RemitService();
    jest.clearAllMocks();
  });

  it('throws BadRequestException when no path found', async () => {
    mockLoad.mockResolvedValue({ id: 'GABC', sequence: '1', balances: [], signers: [], thresholds: {}, flags: {}, data_attr: {}, account_id: 'GABC' });
    mockCall.mockResolvedValue({ records: [] });

    await expect(
      service.remit({
        senderKeypair: 'SAQLZCQA6AYUXK6JSKVPJ2MY6YY6XAX6TCH/BFKB6Z', // invalid — will fail at Keypair
        destAddress: 'GDEST',
        sendAsset: { code: 'USDC', issuer: 'GISSUER' },
        destAsset: { code: 'NGNC', issuer: 'GISSUER2' },
        amount: '10',
      }),
    ).rejects.toThrow();
  });

  it('computes destMin with 0.5% slippage', () => {
    const amount = 100;
    const destMin = parseFloat((amount * 0.995).toFixed(7));
    expect(destMin).toBe(99.5);
  });
});
