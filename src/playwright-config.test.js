import { describe, it, expect, vi } from 'vitest';

describe('playwright config', () => {
  it('reuses an existing server on CI', async () => {
    const originalCi = process.env.CI;
    process.env.CI = 'true';
    vi.resetModules();

    const { default: config } = await import('../playwright.config.js');

    expect(config.webServer.reuseExistingServer).toBe(true);

    if (originalCi === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = originalCi;
    }
  });
});
