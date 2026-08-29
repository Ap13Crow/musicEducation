import {
  isValidPackageSize, isValidSubscriptionTermMonths, defaultSubscriptionDiscountPct,
  computeSubscriptionTotal, computeSubscriptionUndiscountedTotal,
} from '../lib/pricing';

describe('isValidPackageSize / isValidSubscriptionTermMonths', () => {
  it.each([5, 10, 20])('accepts package size %d', (v) => expect(isValidPackageSize(v)).toBe(true));
  it.each([1, 4, 15, 25, 0, -5])('rejects package size %d', (v) => expect(isValidPackageSize(v)).toBe(false));

  it.each([6, 12])('accepts subscription term %d months', (v) => expect(isValidSubscriptionTermMonths(v)).toBe(true));
  it.each([1, 3, 9, 24, 0])('rejects subscription term %d months', (v) => expect(isValidSubscriptionTermMonths(v)).toBe(false));
});

describe('defaultSubscriptionDiscountPct', () => {
  it('6-month default is 10%', () => expect(defaultSubscriptionDiscountPct(6)).toBe(10));
  it('12-month default is 25%', () => expect(defaultSubscriptionDiscountPct(12)).toBe(25));
});

describe('computeSubscriptionTotal', () => {
  it('6-month upfront at 10% off: 100/mo x 6 = 600, less 10% = 540.00', () => {
    expect(computeSubscriptionTotal(100, 6, 10)).toBe(540);
  });

  it('12-month upfront at 20% off: 100/mo x 12 = 1200, less 20% = 960.00', () => {
    expect(computeSubscriptionTotal(100, 12, 20)).toBe(960);
  });

  it('0% discount equals the plain monthly x term total', () => {
    expect(computeSubscriptionTotal(89.5, 6, 0)).toBe(computeSubscriptionUndiscountedTotal(89.5, 6));
  });

  it('rounds to the nearest cent rather than drifting with floating point (classic 0.1+0.2 trap)', () => {
    // 79.90/mo is exactly the kind of value that breaks naive float math.
    const result = computeSubscriptionTotal(79.9, 6, 10);
    expect(result).toBeCloseTo(431.46, 2);
    // And it must be an exact 2-decimal value, not e.g. 431.46000000000004.
    expect(Number.isInteger(result * 100)).toBe(true);
  });

  it('exact rounding at a .5-cent boundary rounds half up', () => {
    // 33.33/mo x 3 = 99.99, less 10% = 89.991 -> rounds to 89.99.
    const result = computeSubscriptionTotal(33.33, 3, 10);
    expect(Number.isInteger(result * 100)).toBe(true);
  });
});

describe('computeSubscriptionUndiscountedTotal', () => {
  it('is a plain multiplication with no discount applied', () => {
    expect(computeSubscriptionUndiscountedTotal(150, 12)).toBe(1800);
  });
});
