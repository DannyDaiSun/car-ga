import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Behavior backlog', () => {
  it('directs new behaviors into agent/behaviors', async () => {
    const content = await readFile(resolve(process.cwd(), 'agent/BEHAVIOR_BACKLOG.md'), 'utf8');

    expect(content).toMatch(/agent\/behaviors/);
  });
});
