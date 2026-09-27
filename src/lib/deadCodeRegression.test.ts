import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dead Code & Dependency Hygiene (Phase 1 Regression)', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('confirms lucide-react, tailwind-merge, and clsx are removed from package.json', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(allDeps['lucide-react']).toBeUndefined();
    expect(allDeps['tailwind-merge']).toBeUndefined();
    expect(allDeps['clsx']).toBeUndefined();
  });

  it('confirms PixelMascot is removed from src/ui/pixel/index.ts and filesystem', () => {
    const mascotPath = path.join(rootDir, 'src/ui/pixel/PixelMascot.tsx');
    expect(fs.existsSync(mascotPath)).toBe(false);

    const indexPath = path.join(rootDir, 'src/ui/pixel/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    expect(indexContent).not.toContain('PixelMascot');
  });

  it('confirms stale supabase/patches/001_fix_standings_add_abort.sql is deleted', () => {
    const patchPath = path.join(rootDir, 'supabase/patches/001_fix_standings_add_abort.sql');
    expect(fs.existsSync(patchPath)).toBe(false);
  });
});
