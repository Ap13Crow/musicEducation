import { creditBalance, grantCredits, consumeCredit, restoreCredit } from '../lib/lessonCredits';

function fakeTx(sumAmount: number | null) {
  return {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 'purchase-1' }]),
    lessonCreditLedgerEntry: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: sumAmount } }),
      create: jest.fn().mockResolvedValue({}),
    },
    lessonPackagePurchase: {
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  } as any;
}

describe('creditBalance', () => {
  it('returns 0 when there are no ledger entries yet', async () => {
    const tx = fakeTx(null);
    expect(await creditBalance(tx, 'purchase-1')).toBe(0);
  });
  it('sums signed ledger amounts', async () => {
    const tx = fakeTx(7);
    expect(await creditBalance(tx, 'purchase-1')).toBe(7);
  });
});

describe('grantCredits', () => {
  it('writes a GRANT entry for the full purchased amount', async () => {
    const tx = fakeTx(0);
    await grantCredits(tx, 'purchase-1', 10);
    expect(tx.lessonCreditLedgerEntry.create).toHaveBeenCalledWith({
      data: { purchaseId: 'purchase-1', type: 'GRANT', amount: 10, note: 'Package purchased.' },
    });
  });
});

describe('consumeCredit', () => {
  it('writes a -1 CONSUME entry when a credit is available', async () => {
    const tx = fakeTx(3);
    await consumeCredit(tx, 'purchase-1', 'booking-1');
    expect(tx.lessonPackagePurchase.updateMany).toHaveBeenCalledWith({
      where: { id: 'purchase-1', firstUsedAt: null },
      data: { firstUsedAt: expect.any(Date) },
    });
    expect(tx.lessonCreditLedgerEntry.create).toHaveBeenCalledWith({
      data: { purchaseId: 'purchase-1', type: 'CONSUME', amount: -1, bookingId: 'booking-1' },
    });
  });

  it('locks the purchase row with FOR UPDATE before reading the balance', async () => {
    const tx = fakeTx(3);
    await consumeCredit(tx, 'purchase-1', 'booking-1');
    const sqlParts = tx.$queryRaw.mock.calls[0][0];
    expect(sqlParts.join('')).toContain('FOR UPDATE');
  });

  it('rejects consumption when the balance is exactly 0', async () => {
    const tx = fakeTx(0);
    await expect(consumeCredit(tx, 'purchase-1', 'booking-1')).rejects.toThrow(/no remaining credits/);
    expect(tx.lessonCreditLedgerEntry.create).not.toHaveBeenCalled();
  });

  it('rejects consumption when the balance has gone negative (defensive - should never happen)', async () => {
    const tx = fakeTx(-1);
    await expect(consumeCredit(tx, 'purchase-1', 'booking-1')).rejects.toThrow(/no remaining credits/);
  });
});

describe('restoreCredit', () => {
  it('writes a +1 RESTORE entry', async () => {
    const tx = fakeTx(0);
    await restoreCredit(tx, 'purchase-1', 'booking-1');
    expect(tx.lessonCreditLedgerEntry.create).toHaveBeenCalledWith({
      data: { purchaseId: 'purchase-1', type: 'RESTORE', amount: 1, bookingId: 'booking-1', note: 'On-time cancellation.' },
    });
  });
});
