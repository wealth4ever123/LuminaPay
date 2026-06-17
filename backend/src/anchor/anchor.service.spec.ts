import { AnchorService } from './anchor.service';

describe('AnchorService', () => {
  let service: AnchorService;
  beforeEach(() => { service = new AnchorService(); });

  it('register returns PENDING status with submitted fields', async () => {
    const dto = {
      account: 'GABC', first_name: 'Amara', last_name: 'Okafor',
      email_address: 'amara@example.com', bank_account_number: '0123456789',
      bank_number: '058', mobile_number: '+2348012345678',
    };
    const result = await service.register(dto);
    expect(result.status).toBe('PENDING');
    expect(result.fields).toEqual(dto);
    expect(result.id).toMatch(/^kyc_/);
  });

  it('deposit returns zero-fee response', async () => {
    const result = await service.deposit({ asset_code: 'USDC', account: 'GABC', amount: '100' });
    expect(result.fee_fixed).toBe('0');
    expect(result.fee_percent).toBe('0');
  });

  it('withdraw returns memo starting with LPW_', async () => {
    const result = await service.withdraw({ asset_code: 'NGNC', account: 'GABC', amount: '5000', dest: '0123456789' });
    expect(result.memo).toMatch(/^LPW_/);
    expect(result.fee_fixed).toBe('0');
  });
});
