import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * STARTUPOLY Public Design System Color Guardrail Test
 * Ensures all Public routes strictly adhere to docs/COLOR_SYSTEM.md tokens
 * and never re-introduce hardcoded raw hex colors (#XXXXXX) in UI chrome.
 *
 * Exemptions per docs/COLOR_SYSTEM.md Section 6:
 * Character & landscape pixel sprite illustrations (clearly-documented sprite-local constants).
 */
function getComponentFiles(dir: string): string[] {
  let files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getComponentFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.test.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Color System Guardrail: src/routes/public/**', () => {
  const publicDir = path.resolve(__dirname, '.');
  const publicComponentFiles = getComponentFiles(publicDir);

  it('found and is checking all canonical public route components', () => {
    expect(publicComponentFiles.length).toBeGreaterThan(8);
  });

  publicComponentFiles.forEach((filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);

    it(`enforces 0 raw hex literals in ${relativePath} (outside documented sprite art constants)`, () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const hexPattern = /#[0-9A-Fa-f]{3,8}\b/g;

      const violations: { line: number; text: string; match: string }[] = [];
      let insideExemptConstantBlock = false;

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Ignore comments
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          return;
        }

        // Detect documented sprite constants block start/end
        if (trimmed.includes('const SCENERY_COLORS = {') || trimmed.includes('const SPRITE_COLORS = {')) {
          insideExemptConstantBlock = true;
          return;
        }
        if (insideExemptConstantBlock) {
          if (trimmed.startsWith('}') || trimmed.startsWith('} as const;')) {
            insideExemptConstantBlock = false;
          }
          return;
        }

        // Single-line documented sprite constant exemption
        if (trimmed.startsWith('const SPRITE_SKIN_TONE =')) {
          return;
        }

        const matches = line.match(hexPattern);
        if (matches) {
          matches.forEach((m) => {
            violations.push({
              line: index + 1,
              text: trimmed,
              match: m,
            });
          });
        }
      });

      expect(
        violations,
        `Found hardcoded raw hex colors in ${relativePath}. Use tokens from docs/COLOR_SYSTEM.md instead:\n` +
          violations.map((v) => `  L${v.line}: ${v.text} (matched: ${v.match})`).join('\n')
      ).toHaveLength(0);
    });
  });
});
