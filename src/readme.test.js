import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('README', () => {
  it('includes GitHub Actions workflow badges', async () => {
    const content = await readFile(resolve(process.cwd(), 'README.md'), 'utf8');

    expect(content).toMatch(/(?=.*unit-tests\.yml)(?=.*scheduled-qa\.yml)/s);
  });
});
