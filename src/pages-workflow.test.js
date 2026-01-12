import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

describe('GitHub Pages deployment workflow', () => {
  it('deploys the built site on pushes to main', async () => {
    const workflow = await readFile(
      resolve(process.cwd(), '.github/workflows/pages.yml'),
      'utf8',
    );

    expect(workflow).toMatch(
      /(?=.*push:\s*\n\s*branches:\s*\[main\])(?=.*actions\/configure-pages)(?=.*upload-pages-artifact)(?=.*actions\/deploy-pages)/s,
    );
  });
});
