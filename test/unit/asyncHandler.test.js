const asyncHandler = require('../../utils/asyncHandler');

describe('asyncHandler Utility Unit Tests', () => {
  test('should invoke wrapped controller with req, res, and next', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const req = {};
    const res = {};
    const next = jest.fn();

    const wrappedFn = asyncHandler(fn);
    await wrappedFn(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  test('should catch rejected errors and pass them to next()', async () => {
    const dummyError = new Error('Async error failed');
    const fn = jest.fn().mockRejectedValue(dummyError);
    const req = {};
    const res = {};
    const next = jest.fn();

    const wrappedFn = asyncHandler(fn);
    await wrappedFn(req, res, next);

    expect(next).toHaveBeenCalledWith(dummyError);
  });
});