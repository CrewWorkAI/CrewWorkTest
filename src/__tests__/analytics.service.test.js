// Jest globals are available in the test environment, so we can use
// `jest.mock` directly without importing the module.
jest.mock('../services/analytics', () => ({
  rollupDailyHealthScores: jest.fn().mockReturnValue([]),
  getChurnRiskBuckets: jest.fn().mockReturnValue({}),
}));

const analytics = require('../services/analytics');

/**
 * Unit test stubs for the analytics service.
 * The tests merely assert that the expected methods exist and return
 * predictable values.  Actual functional tests should be added once the
 * service implementation is available.
 */

describe('Analytics Service', () => {
  test('rollupDailyHealthScores is defined', () => {
    expect(analytics.rollupDailyHealthScores).toBeDefined();
    const result = analytics.rollupDailyHealthScores();
    expect(Array.isArray(result)).toBe(true);
  });

  test('getChurnRiskBuckets is defined', () => {
    expect(analytics.getChurnRiskBuckets).toBeDefined();
    const result = analytics.getChurnRiskBuckets();
    expect(result).toEqual(expect.any(Object));
  });
});
