import { getApiUrl } from './config';

describe('getApiUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_API_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses the current hostname when no API override is set', () => {
    window.history.replaceState({}, '', 'http://localhost:3000/dashboard');
    expect(getApiUrl()).toBe('http://localhost:5000/api');
  });

  it('uses the configured API URL when one is provided', () => {
    process.env.REACT_APP_API_URL = 'http://example.com/api';
    expect(getApiUrl()).toBe('http://example.com/api');
  });
});
