import { CorridorsService } from './corridors.service';

const mockCallFn = jest.fn();

jest.mock('@stellar/stellar-sdk', () => {
  const actual = jest.requireActual('@stellar/stellar-sdk');
  return {
    ...actual,
    Horizon: {
      Server: jest.fn().mockImplementation(() => ({
        strictSendPaths: () => ({ call: mockCallFn }),
      })),
    },
  };
});

describe('CorridorsService', () => {
  beforeEach(() => mockCallFn.mockReset());

  it('returns 4 corridor results', async () => {
    mockCallFn.mockResolvedValue({ records: [{ destination_amount: '1500', path: [] }] });
    const result = await new CorridorsService().getCorridors('10');
    expect(result).toHaveLength(4);
  });

  it('returns bestRate from first path record', async () => {
    mockCallFn.mockResolvedValue({ records: [{ destination_amount: '9500.25', path: [] }] });
    const result = await new CorridorsService().getCorridors('10') as any[];
    expect(result[0].bestRate).toBe('9500.25');
  });

  it('handles failed corridors gracefully without throwing', async () => {
    mockCallFn.mockRejectedValue(new Error('Network error'));
    const result = await new CorridorsService().getCorridors('10');
    expect(result).toHaveLength(4);
    result.forEach((r) => expect(r).toHaveProperty('error'));
  });
});
