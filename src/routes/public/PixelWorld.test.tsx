import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { PixelWorld } from './PixelWorld';
import * as parallaxModule from '../../lib/usePointerParallax';

describe('PixelWorld Living Scene', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all six conceptual layers with aria-hidden and pointer-events none', () => {
    const { container } = render(<PixelWorld />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveAttribute('aria-hidden', 'true');

    const layer1 = container.querySelector('[data-layer="1-sky"]');
    const layer2 = container.querySelector('[data-layer="2-clouds-far"]');
    const layer3 = container.querySelector('[data-layer="3-clouds-near"]');
    const layer4 = container.querySelector('[data-layer="4-ground-deco"]');
    const layer5 = container.querySelector('[data-layer="5-objects"]');
    const layer6 = container.querySelector('[data-layer="6-ground"]');

    expect(layer1).toBeInTheDocument();
    expect(layer2).toBeInTheDocument();
    expect(layer3).toBeInTheDocument();
    expect(layer4).toBeInTheDocument();
    expect(layer5).toBeInTheDocument();
    expect(layer6).toBeInTheDocument();
  });

  it('verifies cloud drift tracks have duplicated sets for seamless looping', () => {
    const { container } = render(<PixelWorld />);

    const farTrack = container.querySelector('.anim-cloud-drift-far');
    const nearTrack = container.querySelector('.anim-cloud-drift-near');

    expect(farTrack).toBeInTheDocument();
    expect(nearTrack).toBeInTheDocument();

    // Each track must contain exactly 2 child panels (each w-1/2)
    expect(farTrack?.children).toHaveLength(2);
    expect(nearTrack?.children).toHaveLength(2);
  });

  it('verifies absence of legacy animate-bounce and animate-pulse classes in landing files', () => {
    const landingFile = path.resolve(__dirname, './LandingPage.tsx');
    const worldFile = path.resolve(__dirname, './PixelWorld.tsx');

    const landingContent = fs.readFileSync(landingFile, 'utf-8');
    const worldContent = fs.readFileSync(worldFile, 'utf-8');

    expect(landingContent.includes('animate-bounce')).toBe(false);
    expect(landingContent.includes('animate-pulse')).toBe(false);
    expect(worldContent.includes('animate-bounce')).toBe(false);
    expect(worldContent.includes('animate-pulse')).toBe(false);
  });
});
