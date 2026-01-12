import { describe, it, expect } from 'vitest';
import config from '../vitest.config.js';

describe('vitest config', () => {
  it('excludes e2e tests from unit runs', () => {
    expect(config.test.exclude).toContain('e2e/**');
  });
});
