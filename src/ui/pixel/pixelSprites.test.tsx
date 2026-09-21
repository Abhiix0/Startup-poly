import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';
import {
  PixelPoly,
  PixelMonitor,
  PixelClockIcon,
  PixelTeamIcon,
  PixelBuildingIcon,
  PixelGrassTuft,
  PixelBug,
} from './index';

describe('Pixel Sprites Suite & IP Safety', () => {
  it('renders PixelPoly in various animation modes without throwing', () => {
    const { rerender } = render(<PixelPoly size={32} animation="static" />);
    expect(document.querySelector('svg')).toBeInTheDocument();

    rerender(<PixelPoly size={48} animation="idle" />);
    rerender(<PixelPoly size={48} animation="walk" />);
    rerender(<PixelPoly size={48} animation="hop" />);
    rerender(<PixelPoly size={48} animation="lean" />);
  });

  it('renders PixelMonitor with blinking cursor', () => {
    const { container } = render(<PixelMonitor size={24} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders HUD icons: Clock, Team, Building', () => {
    const { container: c1 } = render(<PixelClockIcon size={16} />);
    const { container: c2 } = render(<PixelTeamIcon size={16} />);
    const { container: c3 } = render(<PixelBuildingIcon size={16} />);

    expect(c1.querySelector('svg')).toBeInTheDocument();
    expect(c2.querySelector('svg')).toBeInTheDocument();
    expect(c3.querySelector('svg')).toBeInTheDocument();
  });

  it('renders scenery props: PixelGrassTuft and PixelBug', () => {
    const { container: tuft1 } = render(<PixelGrassTuft size={16} variant={1} />);
    const { container: tuft2 } = render(<PixelGrassTuft size={16} variant={2} />);
    const { container: bug } = render(<PixelBug size={20} />);

    expect(tuft1.querySelector('svg')).toBeInTheDocument();
    expect(tuft2.querySelector('svg')).toBeInTheDocument();
    expect(bug.querySelector('svg')).toBeInTheDocument();
  });

  it('guarantees IP safety: verifies zero occurrences of Goomba or PixelCharacter in src/', () => {
    const srcDir = path.resolve(__dirname, '../../');
    const filesToScan: string[] = [];

    function collectFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          collectFiles(fullPath);
        } else if (/\.(tsx?|jsx?|css|html|json)$/.test(entry.name)) {
          filesToScan.push(fullPath);
        }
      }
    }

    collectFiles(srcDir);

    for (const filePath of filesToScan) {
      // Exclude this test file itself from the search
      if (filePath === __filename) continue;

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(
        content.includes('PixelCharacter') || content.includes('Goomba'),
        `Forbidden Nintendo IP token found in ${path.relative(srcDir, filePath)}`
      ).toBe(false);
    }
  });
});
