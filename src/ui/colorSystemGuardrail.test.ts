import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * STARTUPOLY Design System Color Guardrail Test
 * Ensures shared UI components strictly adhere to docs/COLOR_SYSTEM.md tokens
 * and never re-introduce hardcoded raw hex colors (#XXXXXX).
 *
 * Exemptions per docs/COLOR_SYSTEM.md Section 6:
 * Character & landscape pixel sprite illustrations (multi-tone dithering / sprite art).
 */
const SPRITE_ART_EXEMPTIONS = new Set([
  'CastleBackground.tsx',
  'PixelBrickTile.tsx',
  'PixelBug.tsx',
  'PixelBuildingIcon.tsx',
  'PixelBusinessIcon.tsx',
  'PixelClockIcon.tsx',
  'PixelCloud.tsx',
  'PixelCloudFluffy.tsx',
  'PixelCoin.tsx',
  'PixelFlower.tsx',
  'PixelGrassTuft.tsx',
  'PixelHill.tsx',
  'PixelLevelPips.tsx',
  'PixelMario.tsx',
  'PixelMonitor.tsx',
  'PixelMushroom.tsx',
  'PixelPhoneIcon.tsx',
  'PixelPipe.tsx',
  'PixelPoly.tsx',
  'PixelQuestionBlock.tsx',
  'PixelSparkle.tsx',
  'PixelStar.tsx',
  'PixelTeamIcon.tsx',
  'PixelTerminalIcon.tsx',
  'PixelTrophy.tsx',
  'PlainsBackground.tsx',
  'RoamingCharacter.tsx',
  // Test fixture files containing mock data colors
  'Leaderboard.test.tsx',
  'ArcadeLink.test.tsx',
]);

function getFilesInDir(dir: string): string[] {
  let files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getFilesInDir(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Color System Guardrail: src/ui/**', () => {
  const uiDir = path.resolve(__dirname, '.');
  const allUiFiles = getFilesInDir(uiDir);

  const sharedComponentFiles = allUiFiles.filter((filePath) => {
    const fileName = path.basename(filePath);
    return !SPRITE_ART_EXEMPTIONS.has(fileName);
  });

  it('found and is checking all canonical shared UI components', () => {
    expect(sharedComponentFiles.length).toBeGreaterThan(15);
  });

  sharedComponentFiles.forEach((filePath) => {
    const relativePath = path.relative(process.cwd(), filePath);

    it(`enforces 0 raw hex literals in ${relativePath}`, () => {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const hexPattern = /#[0-9A-Fa-f]{3,8}\b/g;

      const violations: { line: number; text: string; match: string }[] = [];

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Ignore single-line comments or docblock lines
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
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
