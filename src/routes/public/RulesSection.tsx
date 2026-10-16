import React, { useState } from 'react';

export interface BoardSpace {
  num: number;
  name: string;
  category: 'START' | 'BUSINESS' | 'ACTION' | 'BONUS' | 'CRISIS' | 'WILDCARD';
  detail: string;
  cost?: string;
  isProvisional?: boolean;
}

export const BOARD_SPACES_24: BoardSpace[] = [
  { num: 1, name: 'START', category: 'START', detail: 'Lap reward: +₹200 Cash. Portfolio bonus: 2 biz = +200 CV, 3 biz = +500 CV' },
  { num: 2, name: 'EdTech', category: 'BUSINESS', detail: 'Base cost ₹200 · Initial +150 CV. U1: ₹150, U2: ₹200', cost: '₹200' },
  { num: 3, name: 'BONUS', category: 'BONUS', detail: 'Draw Bonus Card (1–6): Grants cash or CV windfall' },
  { num: 4, name: 'SaaS', category: 'BUSINESS', detail: 'Base cost ₹300 · Initial +180 CV. U1: ₹200, U2: ₹250', cost: '₹300' },
  { num: 5, name: 'CRISIS', category: 'CRISIS', detail: 'Draw Crisis Card (1–6): Market drop or penalty fee' },
  { num: 6, name: 'E-Commerce', category: 'BUSINESS', detail: 'Base cost ₹300 · Initial +180 CV. U1: ₹200, U2: ₹250', cost: '₹300' },
  { num: 7, name: 'ACTION B', category: 'ACTION', detail: 'Pitch to Investors: 30-sec live elevator pitch to Game Master' },
  { num: 8, name: 'FinTech', category: 'BUSINESS', detail: 'Base cost ₹400 · Initial +200 CV. U1: ₹250, U2: ₹300', cost: '₹400' },
  { num: 9, name: 'BONUS', category: 'BONUS', detail: 'Draw Bonus Card (1–6): Grants cash or CV windfall' },
  { num: 10, name: 'HealthTech', category: 'BUSINESS', detail: 'Base cost ₹400 · Initial +200 CV. U1: ₹250, U2: ₹300', cost: '₹400' },
  { num: 11, name: 'CRISIS', category: 'CRISIS', detail: 'Draw Crisis Card (1–6): Market drop or penalty fee' },
  { num: 12, name: 'WILDCARD 1', category: 'WILDCARD', detail: 'Live sponsor challenge announced by Game Master', isProvisional: true },
  { num: 13, name: 'ACTION C', category: 'ACTION', detail: 'Lose the Feature: Technical regression penalty of −200 CV (floor 0)' },
  { num: 14, name: 'AI / DeepTech', category: 'BUSINESS', detail: 'Base cost ₹500 · Initial +250 CV. U1: ₹300, U2: ₹350', cost: '₹500' },
  { num: 15, name: 'BONUS', category: 'BONUS', detail: 'Draw Bonus Card (1–6): Grants cash or CV windfall' },
  { num: 16, name: 'DevTools', category: 'BUSINESS', detail: 'Base cost ₹300 · Initial +190 CV. U1: ₹200, U2: ₹250', cost: '₹300', isProvisional: true },
  { num: 17, name: 'CRISIS', category: 'CRISIS', detail: 'Draw Crisis Card (1–6): Market drop or penalty fee' },
  { num: 18, name: 'Cybersecurity', category: 'BUSINESS', detail: 'Base cost ₹400 · Initial +220 CV. U1: ₹250, U2: ₹300', cost: '₹400', isProvisional: true },
  { num: 19, name: 'ACTION D', category: 'ACTION', detail: 'Steal Talent: Choose rival team and steal up to ₹100 cash' },
  { num: 20, name: 'CleanTech', category: 'BUSINESS', detail: 'Base cost ₹500 · Initial +240 CV. U1: ₹300, U2: ₹350', cost: '₹500', isProvisional: true },
  { num: 21, name: 'BONUS', category: 'BONUS', detail: 'Draw Bonus Card (1–6): Grants cash or CV windfall' },
  { num: 22, name: 'Robotics & IoT', category: 'BUSINESS', detail: 'Base cost ₹500 · Initial +250 CV. U1: ₹300, U2: ₹350', cost: '₹500', isProvisional: true },
  { num: 23, name: 'CRISIS', category: 'CRISIS', detail: 'Draw Crisis Card (1–6): Market drop or penalty fee' },
  { num: 24, name: 'WILDCARD 2', category: 'WILDCARD', detail: 'Venture challenge event announced by Game Master', isProvisional: true },
];

export const BUSINESS_CATALOG_FULL = [
  { name: 'EdTech', cost: 200, cv: 150, u1Cost: 150, u1Cv: 300, u2Cost: 200, u2Cv: 400, l0Rent: 100, l1Rent: 150, l2Rent: 200, isProvisional: false },
  { name: 'SaaS', cost: 300, cv: 180, u1Cost: 200, u1Cv: 300, u2Cost: 250, u2Cv: 400, l0Rent: 150, l1Rent: 225, l2Rent: 300, isProvisional: false },
  { name: 'E-Commerce', cost: 300, cv: 180, u1Cost: 200, u1Cv: 300, u2Cost: 250, u2Cv: 400, l0Rent: 150, l1Rent: 225, l2Rent: 300, isProvisional: false },
  { name: 'FinTech', cost: 400, cv: 200, u1Cost: 250, u1Cv: 300, u2Cost: 300, u2Cv: 400, l0Rent: 200, l1Rent: 300, l2Rent: 400, isProvisional: false },
  { name: 'HealthTech', cost: 400, cv: 200, u1Cost: 250, u1Cv: 300, u2Cost: 300, u2Cv: 400, l0Rent: 200, l1Rent: 300, l2Rent: 400, isProvisional: false },
  { name: 'AI / DeepTech', cost: 500, cv: 250, u1Cost: 300, u1Cv: 300, u2Cost: 350, u2Cv: 400, l0Rent: 250, l1Rent: 375, l2Rent: 500, isProvisional: false },
  { name: 'DevTools / Infrastructure', cost: 300, cv: 190, u1Cost: 200, u1Cv: 300, u2Cost: 250, u2Cv: 400, l0Rent: 150, l1Rent: 225, l2Rent: 300, isProvisional: true },
  { name: 'Cybersecurity', cost: 400, cv: 220, u1Cost: 250, u1Cv: 300, u2Cost: 300, u2Cv: 400, l0Rent: 200, l1Rent: 300, l2Rent: 400, isProvisional: true },
  { name: 'CleanTech / Energy', cost: 500, cv: 240, u1Cost: 300, u1Cv: 300, u2Cost: 350, u2Cv: 400, l0Rent: 250, l1Rent: 375, l2Rent: 500, isProvisional: true },
  { name: 'Robotics & IoT', cost: 500, cv: 250, u1Cost: 300, u1Cv: 300, u2Cost: 350, u2Cv: 400, l0Rent: 250, l1Rent: 375, l2Rent: 500, isProvisional: true },
];

export const BONUS_CARDS_FULL = [
  { num: '1', title: 'Startup Grant', effect: '+₹300 Cash', detail: 'Government equity-free grant credited directly to cash balance.' },
  { num: '2', title: 'Viral Growth', effect: '+300 CV', detail: 'Organic social breakout and press coverage permanently increases Company Value.' },
  { num: '3', title: 'Government Incentive', effect: '+₹200 Cash & +200 CV', detail: 'R&D tax credits and economic growth grant increase both cash and valuation.' },
  { num: '4', title: 'Premium Deal', effect: '+Cash equal to most expensive owned business', detail: 'Strategic enterprise contract pays cash equal to the base purchase cost of your most valuable owned business.' },
  { num: '5', title: 'Founder Bonus', effect: '₹100 Cash × Businesses Owned', detail: 'Ecosystem dividend rewarding portfolio size (e.g. 3 businesses = +₹300 cash).' },
  { num: '6', title: 'Lucky Break', effect: '₹100 Cash × Die Roll', detail: 'Roll physical die immediately: gain ₹100 × roll as cash reward. Pawn remains on current space.' },
];

export const CRISIS_CARDS_FULL = [
  { num: '1', title: 'Tax Raid', effect: '−₹300 Cash', detail: 'Regulatory audit penalty. If short on cash, forced sales are triggered.' },
  { num: '2', title: 'Market Crash', effect: '−300 CV (floor 0)', detail: 'Macroeconomic downturn depresses Company Value. CV cannot drop below zero.' },
  { num: '3', title: 'Legal Trouble', effect: '−₹200 Cash & −200 CV', detail: 'Patent dispute settlement costs cash and reduces enterprise valuation.' },
  { num: '4', title: 'Burn Rate Spike', effect: '−₹100 Cash × Businesses Owned', detail: 'Infrastructure cost inflation scales with your operations (e.g. 3 businesses = −₹300 cash).' },
  { num: '5', title: 'Bad PR', effect: '−₹100 Cash & −200 CV', detail: 'Reputational fallout requires PR spend and damages market valuation.' },
  { num: '6', title: 'Investor Pullout', effect: '−₹500 Cash', detail: 'Anchor investor retracts bridge round. Severe liquidity test.' },
];

// Sprite colors for team token visualization (exempted from UI token rules)
const SPRITE_COLORS = {
  team1: '#E52521', // Crimson
  team2: '#0099FF', // Cerulean
  team3: '#22C55E', // Emerald
  team4: '#FFCC00', // Gold
  team5: '#A855F7', // Violet
  team6: '#EC4899', // Rose
} as const;

export const TEMPORARY_TEAM_COLORS = [
  { name: 'Team 1', color: SPRITE_COLORS.team1, label: 'Crimson' },
  { name: 'Team 2', color: SPRITE_COLORS.team2, label: 'Cerulean' },
  { name: 'Team 3', color: SPRITE_COLORS.team3, label: 'Emerald' },
  { name: 'Team 4', color: SPRITE_COLORS.team4, label: 'Gold' },
  { name: 'Team 5', color: SPRITE_COLORS.team5, label: 'Violet' },
  { name: 'Team 6', color: SPRITE_COLORS.team6, label: 'Rose' },
];

export const RULE_SECTIONS = [
  {
    id: 'objective',
    title: 'Objective & Match Timing',
    icon: '★',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Tournament Objective:</strong> Build the highest Company Value (CV) portfolio while managing working cash before the 50:00 match clock expires.
        </p>
        <div className="bg-[brand-navy] text-white p-3 border-2 border-[neutral-950] flex flex-col gap-1.5">
          <p className="font-pixel text-[10px] text-[brand-gold]">OFFICIAL SCHEDULE (60 MIN TOTAL)</p>
          <p>• <strong>5 Min Setup:</strong> PIN cards handed to team captains; each team connects 1 mobile phone at <code>/join</code>.</p>
          <p>• <strong>50 Min Live Gameplay:</strong> Strict authoritative server timer. Physical dice rolls recorded on Game Master console.</p>
          <p>• <strong>5 Min Reset & Audit:</strong> Post-match reconciliation window. Notes mandatory for any adjustments; ties resolved; official results finalized.</p>
        </div>
        <p>
          <strong>Starting Condition:</strong> Each team starts with exactly <strong>₹1,000 cash</strong>, <strong>0 Company Value (CV)</strong>, and <strong>0 businesses owned</strong>. Exactly 5 or 6 teams participate (4–5 players per team).
        </p>
      </div>
    ),
  },
  {
    id: 'turn-system',
    title: 'Turn System & Dice Movement',
    icon: '↻',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Turn Order:</strong> Teams take turns in strict round-robin order (Team 1 → Team 2 → … → Team N).
        </p>
        <p>
          <strong>Dice Movement:</strong> On your team&apos;s turn, roll one standard 6-sided physical die on the physical track. Move your team token forward by exactly that number of spaces and resolve the landing before the next team rolls.
        </p>
        <div className="bg-[status-warning-bg] text-[brand-navy] p-3 border-2 border-[status-warning-dark]">
          <p className="font-pixel text-[10px] text-[status-warning-dark] mb-1">DICE EXCEPTIONS</p>
          <p>• <strong>Extra Roll on Six:</strong> Rolling a 6 awards an immediate additional roll after resolving the first space.</p>
          <p>• <strong>Three Sixes Rule:</strong> Rolling three consecutive 6s in a single turn cancels the entire turn immediately, undoing all transactions from that turn, and passes play to the next team.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'start-growth',
    title: 'START & Portfolio Growth',
    icon: '↗',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Lap Reward:</strong> Passing or landing on <strong>START</strong> completes a circuit of the 24-space board and awards <strong>+₹200 Cash</strong>.
        </p>
        <p>
          <strong>Growth Scale Bonus:</strong> Founders who build diversified operations receive additional Company Value when passing START:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[status-success-bg] text-[status-success-dark] border-2 border-[brand-green] p-2.5">
            <span className="font-pixel text-[9px] block">2 BUSINESSES OWNED</span>
            <span className="font-bold">+₹200 Cash & +200 CV bonus</span>
          </div>
          <div className="bg-[status-success-bg] text-[status-success-dark] border-2 border-[brand-green] p-2.5">
            <span className="font-pixel text-[9px] block">3 BUSINESSES OWNED</span>
            <span className="font-bold">+₹200 Cash & +500 CV bonus</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ownership-catalog',
    title: 'Ownership Limit & Catalog',
    icon: '◆',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Maximum 3 Businesses:</strong> A team may own at most <strong>3 businesses</strong> at any time. If you land on an unowned business while holding 3, you cannot buy it unless you sell an existing one.
        </p>
        <p>
          <strong>The 10 Startup Sectors:</strong> Initial purchase deducts cash and permanently awards initial CV.
        </p>
        <div className="bg-[neutral-50] text-[brand-navy] border-2 border-[brand-navy] p-2 text-xs">
          <p className="font-pixel text-[9px] text-[brand-brick] mb-1">SECTOR BREAKDOWN</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BUSINESS_CATALOG_FULL.map((b) => (
              <div key={b.name} className="border border-[neutral-300] bg-white p-1.5 flex items-center justify-between">
                <div>
                  <span className="font-bold block">{b.name} {b.isProvisional && <span className="text-[9px] text-[status-warning-dark]">[PROV]</span>}</span>
                  <span className="text-[10px] text-[neutral-500]">Cost: ₹{b.cost}</span>
                </div>
                <span className="font-bold text-[status-success-dark]">+{b.cv} CV</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'upgrades-rent',
    title: 'Upgrades & Rent Calculations',
    icon: '▲',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Upgrades (Level 0 → 1 → 2):</strong> When visiting your own business or through operator action, you can upgrade up to 2 times. Upgrades cost cash and award permanent CV gains (+300 CV for U1, +400 CV for U2).
        </p>
        <p>
          <strong>Rent on Rivals:</strong> When an opponent lands on your business, they pay Rent to you based on its upgrade level:
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white border-2 border-[brand-navy] p-2">
            <span className="font-pixel text-[9px] text-[neutral-500] block">BASE (LEVEL 0)</span>
            <span className="font-bold text-sm block mt-1">50%</span>
            <span className="text-[10px] text-[neutral-500]">Owner gets 50% CV</span>
          </div>
          <div className="bg-white border-2 border-[brand-navy] p-2">
            <span className="font-pixel text-[9px] text-[neutral-500] block">UPGRADE 1</span>
            <span className="font-bold text-sm block mt-1">75%</span>
            <span className="text-[10px] text-[neutral-500]">Owner gets 75% CV</span>
          </div>
          <div className="bg-white border-2 border-[brand-navy] p-2">
            <span className="font-pixel text-[9px] text-[neutral-500] block">UPGRADE 2</span>
            <span className="font-bold text-sm block mt-1">100%</span>
            <span className="text-[10px] text-[neutral-500]">Owner gets 100% CV</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'action-spaces',
    title: 'Action Spaces (B, C, D)',
    icon: '⚡',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <div className="bg-[status-warning-bg] text-[brand-navy] p-3 border-2 border-[status-warning-dark]">
          <span className="font-pixel text-[10px] text-[status-warning-dark] block">ACTION B · SPACE 07</span>
          <p className="font-bold text-sm mt-0.5">Pitch to Investors</p>
          <p className="text-xs text-[neutral-500] mt-1">
            The active team delivers a 30-second live physical pitch judged by the Game Master / Investors to win venture funding and strategic advantage.
          </p>
        </div>
        <div className="bg-[status-danger-bg] text-[brand-navy] p-3 border-2 border-[brand-red]">
          <span className="font-pixel text-[10px] text-[brand-red] block">ACTION C · SPACE 13</span>
          <p className="font-bold text-sm mt-0.5">Lose the Feature (−200 CV Penalty)</p>
          <p className="text-xs text-[neutral-500] mt-1">
            Technical debt or outage regression. Deducts −200 CV from the team. CV is strictly capped at floor 0 (never negative).
          </p>
        </div>
        <div className="bg-[neutral-50] text-[brand-navy] p-3 border-2 border-[brand-navy]">
          <span className="font-pixel text-[10px] text-[brand-navy] block">ACTION D · SPACE 19</span>
          <p className="font-bold text-sm mt-0.5">Steal Talent (Poach up to ₹100)</p>
          <p className="text-xs text-[neutral-500] mt-1">
            The active team poaches key personnel from a chosen rival. The target team loses up to ₹100 cash (capped at what they actually hold), credited to the active team.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'cards',
    title: 'Bonus & Crisis Cards',
    icon: '🃏',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          Landing on Bonus or Crisis spaces triggers a card draw. All 6 Bonus cards and all 6 Crisis cards are mathematically balanced:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[status-success-dark] text-[status-warning-bg] p-2.5 border-2 border-[neutral-950]">
            <span className="font-pixel text-[9px] block mb-1 text-[brand-gold]">BONUS CARDS (1–6)</span>
            <ul className="space-y-1 text-[11px]">
              <li>#1: Startup Grant (+₹300 Cash)</li>
              <li>#2: Viral Growth (+300 CV)</li>
              <li>#3: Gov Incentive (+₹200 Cash & +200 CV)</li>
              <li>#4: Premium Deal (+Cash = Most expensive owned biz)</li>
              <li>#5: Founder Bonus (₹100 × Businesses owned)</li>
              <li>#6: Lucky Break (Roll die: ₹100 × roll)</li>
            </ul>
          </div>
          <div className="bg-[status-danger-dark] text-[status-warning-bg] p-2.5 border-2 border-[neutral-950]">
            <span className="font-pixel text-[9px] block mb-1 text-[status-danger-light]">CRISIS CARDS (1–6)</span>
            <ul className="space-y-1 text-[11px]">
              <li>#1: Tax Raid (−₹300 Cash)</li>
              <li>#2: Market Crash (−300 CV, floor 0)</li>
              <li>#3: Legal Trouble (−₹200 Cash & −200 CV)</li>
              <li>#4: Burn Rate Spike (−₹100 Cash × Businesses owned)</li>
              <li>#5: Bad PR (−₹100 Cash & −200 CV)</li>
              <li>#6: Investor Pullout (−₹500 Cash)</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'forced-sale-bankrupt',
    title: 'Forced Sales & Bankruptcy',
    icon: '!',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Shortfall & Debt Resolution:</strong> When an obligation (rent or crisis card) exceeds available cash, all cash is depleted to ₹0 first.
        </p>
        <p>
          <strong>Forced Liquidation:</strong> The team must sell owned businesses back to the Bank at <strong>100% of their base purchase cost</strong> to cover the debt.
        </p>
        <p>
          • Upgrade fees previously paid are foregone, but earned Company Value is permanent and never stripped.
        </p>
        <div className="bg-[status-danger-bg] text-[brand-red] border-2 border-[brand-red] p-3 font-bold">
          <p className="font-pixel text-[10px] uppercase">BANKRUPTCY CONDITION</p>
          <p className="font-mono text-xs mt-1">
            If a team has ₹0 cash, has liquidated all 3 businesses, and still has unpaid debt: The team is declared BANKRUPT and eliminated from the tournament.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'victory-tiebreak',
    title: 'Winner & Tiebreak Sequence',
    icon: '♛',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <p>
          <strong>Match Finalization (at 00:00):</strong> All dice movement stops immediately. The team with the <strong>Highest Company Value (CV)</strong> is crowned Champion.
        </p>
        <p>
          <strong>Official Tiebreaker Hierarchy:</strong> If two or more teams finish tied on Company Value:
        </p>
        <ol className="list-decimal list-inside space-y-1 bg-[status-warning-bg] text-[brand-navy] p-3 border-2 border-[brand-navy] text-xs">
          <li><strong>Tiebreaker 1:</strong> Highest Cash balance.</li>
          <li><strong>Tiebreaker 2:</strong> Most Businesses Held in portfolio.</li>
          <li><strong>Tiebreaker 3:</strong> <strong>30-Second Physical Pitch</strong> judged live by the Game Master.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'provisional-wildcards',
    title: 'Provisional Rules & Wildcards',
    icon: '✱',
    body: (
      <div className="flex flex-col gap-3 font-mono text-xs sm:text-sm leading-relaxed">
        <div className="bg-[status-warning-light] text-[status-warning-text] p-3 border-2 border-[status-warning-dark]">
          <span className="font-pixel text-[10px] block">PROVISIONAL BUSINESS SECTORS</span>
          <p className="text-xs mt-1">
            DevTools / Infrastructure, Cybersecurity, CleanTech / Energy, and Robotics & IoT are labeled <strong>[PROVISIONAL]</strong>. The balance committee will confirm exact initial cost and upgrade CV parameters prior to tournament day.
          </p>
        </div>
        <div className="bg-[bg-purple-50] text-[text-purple-800] p-3 border-2 border-[border-purple-500]">
          <span className="font-pixel text-[10px] block">WILDCARD SPACES (12 & 24)</span>
          <p className="text-xs mt-1">
            Wildcard spaces represent unannounced venture events, angel challenges, and sponsor activations. Exact mechanics are announced live by the Game Master during the match.
          </p>
        </div>
      </div>
    ),
  },
];

export const RulesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSpace, setSelectedSpace] = useState<BoardSpace | null>(BOARD_SPACES_24[0]);

  const getCategoryColor = (cat: BoardSpace['category']) => {
    switch (cat) {
      case 'START':
        return 'bg-[brand-green] text-[brand-navy] font-bold border-[neutral-950]';
      case 'BUSINESS':
        return 'bg-[neutral-800] text-[status-warning-bg] border-[neutral-950]';
      case 'ACTION':
        return 'bg-[status-warning-dark] text-white border-[neutral-950]';
      case 'BONUS':
        return 'bg-[brand-gold] text-[brand-navy] border-[neutral-950]';
      case 'CRISIS':
        return 'bg-[status-danger-dark] text-white border-[neutral-950]';
      case 'WILDCARD':
        return 'bg-[bg-purple-700] text-white border-[neutral-950]';
      default:
        return 'bg-[neutral-800] text-[status-warning-bg] border-[neutral-950]';
    }
  };

  return (
    <section id="rules" className="relative z-20 bg-[brand-navy] border-y-[6px] border-[neutral-950] text-[status-warning-bg] px-3 sm:px-4 py-10 sm:py-16 scroll-mt-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-pixel text-[9px] bg-[brand-gold] text-[brand-navy] px-2 py-0.5 border border-[brand-navy]">
                OFFICIAL RULEBOOK
              </span>
              <span className="font-pixel text-[9px] bg-[brand-green] text-[brand-navy] font-bold px-2 py-0.5 border border-[brand-navy]">
                24 SPACES
              </span>
            </div>
            <h2 className="font-pixel text-xl sm:text-3xl leading-relaxed text-[status-warning-bg]">
              STARTUPOLY FIELD GUIDE
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[neutral-300] mt-2 max-w-2xl leading-relaxed">
              Official live tournament rules for open-ground play. 24 physical spaces, 50-minute authoritative clock, 5–6 teams, 1 phone per team.
            </p>
          </div>
          <a
            href="#top"
            className="self-start sm:self-auto font-pixel text-[10px] text-[brand-gold] hover:text-white border-2 border-[brand-gold] px-3 py-2 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            BACK TO TOP ↑
          </a>
        </div>

        {/* 2-Column Rules Navigation & Panel */}
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          {/* Rules Tab Selector */}
          <div className="flex flex-col gap-2 max-h-155 overflow-y-auto pr-1">
            {RULE_SECTIONS.map((section, idx) => (
              <button
                type="button"
                key={section.id}
                onClick={() => setActiveTab(idx)}
                className={`text-left border-3 border-[neutral-950] px-3.5 py-2.5 shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform cursor-pointer ${
                  activeTab === idx
                    ? 'bg-[brand-gold] text-[brand-navy] -translate-y-0.5'
                    : 'bg-[neutral-800] text-[status-warning-bg] hover:bg-[neutral-700]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs">
                    {section.icon} {section.title}
                  </span>
                  <span className={`font-mono text-[10px] ${activeTab === idx ? 'text-[brand-navy] font-bold' : 'text-[neutral-300]'}`}>
                    §{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              </button>
            ))}

            {/* Quick Match Specs Pill */}
            <div className="bg-[brand-navy] text-white border-3 border-[neutral-950] p-3 shadow-[3px_3px_0_rgba(0,0,0,1)] mt-2">
              <p className="font-pixel text-[10px] uppercase text-[brand-gold]">MATCH FORMAT SUMMARY</p>
              <p className="font-mono text-xs mt-1.5 leading-relaxed">5 min setup · 50 min clock · 5 min audit reset</p>
              <p className="font-mono text-xs mt-0.5 leading-relaxed">5–6 teams · 4–5 players · 1 phone per team</p>
              <p className="font-mono text-xs mt-0.5 leading-relaxed">₹1,000 Starting Cash · 0 CV · Max 3 businesses</p>
            </div>
          </div>

          {/* Active Rule Details Card */}
          <div className="bg-[neutral-50] text-[brand-navy] border-4 border-[neutral-950] shadow-[6px_6px_0_rgba(0,0,0,1)] p-5 sm:p-7 min-h-90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[neutral-300] pb-3 mb-4">
                <span className="font-pixel text-[10px] text-[brand-brick]">
                  RULEBOOK SECTION {String(activeTab + 1).padStart(2, '0')} OF {RULE_SECTIONS.length}
                </span>
                <span className="font-pixel text-xs bg-[brand-navy] text-[brand-gold] px-2 py-0.5">
                  {RULE_SECTIONS[activeTab].icon}
                </span>
              </div>
              <h3 className="font-pixel text-base sm:text-xl text-[brand-navy] mb-4">
                {RULE_SECTIONS[activeTab].title}
              </h3>
              {RULE_SECTIONS[activeTab].body}
            </div>

            <div className="mt-6 pt-3 border-t border-[neutral-300] flex items-center justify-between text-[11px] font-mono text-[neutral-700] font-semibold">
              <span>Official Startupoly Tournament Codex</span>
              <span>Rulebook §{String(activeTab + 1).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* AUTHORITATIVE 24-SPACE BOARD PLACEHOLDER                                */}
        {/* ======================================================================= */}
        <div className="mt-12 bg-[neutral-800] border-4 border-[neutral-950] shadow-[6px_6px_0_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-white/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-[brand-gold]">24-SPACE PHYSICAL BOARD CIRCUIT</span>
                <span className="font-pixel text-[9px] bg-[status-warning-dark] text-[status-warning-bg] font-bold px-2 py-0.5 border border-[brand-navy]">
                  DESIGN PENDING
                </span>
              </div>
              <p className="font-mono text-xs text-[neutral-300] mt-1">
                Visual track structure for the outdoor game board: 1 START, 10 Businesses, 3 Actions, 4 Bonus, 4 Crisis, 2 Wildcards.
              </p>
            </div>
            <div className="text-right">
              <span className="font-pixel text-[9px] text-[brand-gold] block">INTERACTIVE PLACEHOLDER</span>
              <span className="font-mono text-[10px] text-[neutral-200]">Click any tile to inspect</span>
            </div>
          </div>

          {/* 24 Spaces Grid (6 cols on tablet/desktop, 4 cols on mobile) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 relative">
            {BOARD_SPACES_24.map((space) => {
              const isSelected = selectedSpace?.num === space.num;
              const colorClass = getCategoryColor(space.category);

              return (
                <button
                  type="button"
                  key={space.num}
                  onClick={() => setSelectedSpace(space)}
                  className={`min-h-18 sm:min-h-21 p-2 border-2 text-left flex flex-col justify-between transition-all cursor-pointer relative ${colorClass} ${
                    isSelected ? 'ring-3 ring-[brand-gold] scale-[1.02] shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10' : 'hover:opacity-95'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-[10px] font-bold">
                      #{String(space.num).padStart(2, '0')}
                    </span>
                    <span className="font-pixel text-[8px] uppercase tracking-wider px-1 py-0.2 bg-[brand-navy] text-white font-bold">
                      {space.category}
                    </span>
                  </div>

                  <div className="my-1">
                    <span className="font-pixel text-[9px] sm:text-[10px] block leading-tight truncate">
                      {space.name}
                    </span>
                    {space.cost && (
                      <span className="font-mono text-[9px] block mt-0.5 font-bold">
                        {space.cost}
                      </span>
                    )}
                  </div>

                  {space.isProvisional && (
                    <span className="font-mono text-[8px] bg-[brand-navy] text-[brand-gold] px-1 py-0.5 inline-block uppercase font-bold border border-[brand-navy]">
                      PROV
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Space Detailed Inspector */}
          {selectedSpace && (
            <div className="mt-4 bg-[brand-navy] border-2 border-[brand-gold] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <span className="font-pixel text-sm bg-[brand-gold] text-[brand-navy] w-9 h-9 flex items-center justify-center shrink-0 border border-[brand-navy]">
                  #{String(selectedSpace.num).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs text-white">
                      {selectedSpace.name}
                    </span>
                    <span className="font-pixel text-[9px] text-[brand-gold]">
                      [{selectedSpace.category}]
                    </span>
                    {selectedSpace.isProvisional && (
                      <span className="font-mono text-[9px] bg-[status-warning-dark] text-white px-1.5 py-0.2">
                        PROVISIONAL
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-[neutral-300] mt-0.5">
                    {selectedSpace.detail}
                  </p>
                </div>
              </div>

              <span className="font-pixel text-[9px] text-[brand-gold] bg-white/10 px-2 py-1 shrink-0 self-start sm:self-center">
                SPACE {selectedSpace.num} OF 24
              </span>
            </div>
          )}

          {/* Design Pending Notice Banner */}
          <div className="mt-4 text-center border-2 border-[brand-gold] bg-[brand-navy] py-2 px-3">
            <span className="font-pixel text-[9px] sm:text-[10px] text-[brand-gold] tracking-wide">
              🎨 FINAL BOARD ARTWORK WILL REPLACE THIS PLACEHOLDER — Graphic design team is finalizing the outdoor tournament board print files.
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* SECTORS TABLE & UPGRADE SUMMARY                                         */}
        {/* ======================================================================= */}
        <div className="mt-8 bg-[neutral-50] text-[brand-navy] border-4 border-[neutral-950] shadow-[6px_6px_0_rgba(0,0,0,1)] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-[neutral-300]">
            <div>
              <p className="font-pixel text-[10px] text-[brand-brick]">STARTUP MARKET SPECS</p>
              <h3 className="font-pixel text-sm sm:text-base text-[brand-navy]">
                ALL 10 BUSINESSES & UPGRADE MATRICES
              </h3>
            </div>
            <span className="font-mono text-xs text-[neutral-700] font-semibold">
              Rent: L0 = 50% · L1 = 75% · L2 = 100%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[brand-navy] text-white font-pixel text-[9px]">
                  <th className="p-2 border border-[brand-navy]">SECTOR</th>
                  <th className="p-2 border border-[brand-navy]">COST</th>
                  <th className="p-2 border border-[brand-navy]">BASE CV</th>
                  <th className="p-2 border border-[brand-navy]">UPGRADE 1 (COST / CV)</th>
                  <th className="p-2 border border-[brand-navy]">UPGRADE 2 (COST / CV)</th>
                  <th className="p-2 border border-[brand-navy]">RENT (L0 / L1 / L2)</th>
                  <th className="p-2 border border-[brand-navy]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {BUSINESS_CATALOG_FULL.map((b, i) => (
                  <tr key={b.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[neutral-100]'}>
                    <td className="p-2 font-bold border border-[neutral-300]">{b.name}</td>
                    <td className="p-2 border border-[neutral-300]">₹{b.cost}</td>
                    <td className="p-2 border border-[neutral-300] text-[status-success-dark] font-bold">+{b.cv} CV</td>
                    <td className="p-2 border border-[neutral-300]">₹{b.u1Cost} (+{b.u1Cv} CV)</td>
                    <td className="p-2 border border-[neutral-300]">₹{b.u2Cost} (+{b.u2Cv} CV)</td>
                    <td className="p-2 border border-[neutral-300] font-bold">₹{b.l0Rent} / ₹{b.l1Rent} / ₹{b.l2Rent}</td>
                    <td className="p-2 border border-[neutral-300]">
                      {b.isProvisional ? (
                        <span className="font-pixel text-[8px] bg-[status-warning-light] text-[status-warning-text] px-1.5 py-0.5 border border-[status-warning-dark]">
                          PROVISIONAL
                        </span>
                      ) : (
                        <span className="font-pixel text-[8px] bg-[status-success-bg] text-[status-success-dark] px-1.5 py-0.5 border border-[brand-green]">
                          OFFICIAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* CARDS REFERENCE GRID                                                    */}
        {/* ======================================================================= */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Bonus Cards Card */}
          <div className="bg-[status-success-dark] text-[status-warning-bg] border-4 border-[neutral-950] shadow-[6px_6px_0_rgba(0,0,0,1)] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-white/30 pb-2">
              <span className="font-pixel text-xs">BONUS CARDS (CARDS 1–6)</span>
              <span className="font-pixel text-[9px] bg-[brand-gold] text-[brand-navy] px-1.5 py-0.5">BENEFITS</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {BONUS_CARDS_FULL.map((card) => (
                <div key={card.num} className="bg-[status-success-dark] border border-white/25 p-2 flex gap-3 items-start">
                  <span className="font-pixel text-xs bg-[brand-gold] text-[brand-navy] w-6 h-6 flex items-center justify-center shrink-0 border border-[brand-navy]">
                    #{card.num}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[10px]">{card.title}</span>
                      <span className="font-mono text-xs font-bold text-[brand-gold]">({card.effect})</span>
                    </div>
                    <p className="font-mono text-[11px] text-white/90 mt-0.5 leading-snug">
                      {card.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crisis Cards Card */}
          <div className="bg-[status-danger-dark] text-[status-warning-bg] border-4 border-[neutral-950] shadow-[6px_6px_0_rgba(0,0,0,1)] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-white/30 pb-2">
              <span className="font-pixel text-xs">CRISIS CARDS (CARDS 1–6)</span>
              <span className="font-pixel text-[9px] bg-[brand-gold] text-[brand-navy] px-1.5 py-0.5">PENALTIES</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {CRISIS_CARDS_FULL.map((card) => (
                <div key={card.num} className="bg-[status-danger-dark] border border-white/25 p-2 flex gap-3 items-start">
                  <span className="font-pixel text-xs bg-[brand-gold] text-[brand-navy] w-6 h-6 flex items-center justify-center shrink-0 border border-[brand-navy]">
                    #{card.num}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-[10px]">{card.title}</span>
                      <span className="font-mono text-xs font-bold text-[brand-gold]">({card.effect})</span>
                    </div>
                    <p className="font-mono text-[11px] text-white/90 mt-0.5 leading-snug">
                      {card.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TEMPORARY TEAM COLORS REFERENCE                                         */}
        {/* ======================================================================= */}
        <div className="mt-8 bg-[brand-gold] text-[brand-navy] border-4 border-[neutral-950] shadow-[6px_6px_0_rgba(0,0,0,1)] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b-2 border-[brand-navy] pb-2 mb-3">
            <p className="font-pixel text-[10px] uppercase">TEMPORARY TEAM COLOR ASSIGNMENTS</p>
            <span className="font-pixel text-[9px] bg-[brand-navy] text-white px-2 py-0.5">
              SLOTS 1–6
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {TEMPORARY_TEAM_COLORS.map((tc) => (
              <div key={tc.name} className="bg-white border-2 border-[brand-navy] p-2 flex items-center gap-2 shadow-[2px_2px_0px_brand-navy]">
                <span
                  className="w-5 h-5 border-2 border-[brand-navy] shrink-0"
                  style={{ backgroundColor: tc.color }}
                />
                <div>
                  <span className="font-pixel text-[10px] block">{tc.name}</span>
                  <span className="font-mono text-[10px] text-[neutral-700] font-semibold">{tc.label}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="font-mono text-xs mt-3 leading-relaxed">
            Note: These basic team colors serve as operational placeholders for event readiness. They will be updated once the design team finalizes the Equinox E-Summit palette.
          </p>
        </div>
      </div>
    </section>
  );
};
