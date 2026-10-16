import React from 'react';
import { Link } from 'react-router-dom';
import { RulesSection } from './RulesSection';

export const RulesPage: React.FC = () => (
  <div id="top" className="min-h-screen bg-brand-navy">
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-brand-navy border-b-4 border-neutral-950 px-4 py-3">
      <Link to="/" className="font-pixel text-[10px] text-brand-gold hover:text-white">
        ← STARTUPOLY
      </Link>
      <span className="font-pixel text-[10px] text-neutral-50">FIELD GUIDE</span>
    </header>
    <RulesSection />
  </div>
);
