const AppError = require('../../utils/AppError');

describe('AppError Utility Unit Tests', () => {
  test('should set statusCode to 404 and status to "fail" for 4xx errors', () => {
    const err = new AppError('Not found', 404);
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
  });

  test('should set status to "error" for 5xx status codes', () => {
    const err = new AppError('Server error', 500);
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
  });

  test('should default isOperational property to true', () => {
    const err = new AppError('Bad request', 400);
    expect(err.isOperational).toBe(true);
  });

  test('should be an instance of native JavaScript Error class', () => {
    const err = new AppError('Custom error', 400);
    expect(err).toBeInstanceOf(Error);
  });
});