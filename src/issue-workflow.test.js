import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('issue triage workflow', () => {
  it('triggers on issues and applies the codex label', async () => {
    const workflow = await readFile(
      resolve(process.cwd(), '.github/workflows/issue-codex.yml'),
      'utf8',
    );

    expect(workflow).toMatch(
      /(?=.*issues:\s*\n\s*types:\s*\[opened,\s*reopened\])(?=.*labels:\s*\['codex'\])/s,
    );
  });
});
