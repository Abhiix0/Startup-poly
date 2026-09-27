import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { PixelLogo } from './PixelLogo';

describe('Phase 3: Animation & Reduced-Motion Consistency Pass', () => {
  it('PixelLogo renders stars with custom anim-star-twinkle class and no animate-bounce', () => {
    const { container } = render(<PixelLogo />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBeGreaterThanOrEqual(2);

    stars.forEach((star) => {
      expect(star.className.baseVal || star.className).toContain('anim-star-twinkle');
      expect(star.className.baseVal || star.className).not.toContain('animate-bounce');
    });
  });

  it('guarantees zero occurrences of animate-bounce and animate-spin in src/ application code', () => {
    const srcDir = path.resolve(__dirname, '../../');
    const extensions = ['.ts', '.tsx'];

    function scanDir(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath, fileList);
        } else if (extensions.some((ext) => file.endsWith(ext)) && !file.includes('.test.')) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const appFiles = scanDir(srcDir);
    const violations: { file: string; match: string }[] = [];

    for (const filePath of appFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/animate-(bounce|spin)/g);
      if (matches) {
        violations.push({ file: path.relative(srcDir, filePath), match: matches.join(', ') });
      }
    }

    expect(violations).toEqual([]);
  });

  it('confirms prefers-reduced-motion block in index.css covers newly introduced ambient classes', () => {
    const cssPath = path.resolve(__dirname, '../../index.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const reducedMotionMatch = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\{([\s\S]*?)\n\}/);
    expect(reducedMotionMatch).not.toBeNull();

    const block = reducedMotionMatch![1];
    expect(block).toContain('.anim-star-twinkle');
    expect(block).toContain('.anim-cloud-float');
    expect(block).toContain('.anim-trophy-bob');
  });
});
