import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const BOARD_IMAGE_SRC = '/board.png';

export const SECTIONS = [
  { id: 'overview', title: 'Game Overview' },
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'turns', title: 'How a Turn Works' },
  { id: 'board', title: 'The Board' },
  { id: 'businesses', title: 'Businesses & Upgrades' },
  { id: 'special-spaces', title: 'Special Spaces' },
  { id: 'start-rewards', title: 'START Space' },
  { id: 'cash-debt', title: 'Cash, Debt & Recovery' },
  { id: 'winning', title: 'Winning the Game' },
  { id: 'quick-reference', title: 'Quick Reference' },
] as const;

export const BUSINESSES = [
  { name: 'OpenAI', category: 'AI / DeepTech', cost: 500, baseRent: 250, u1Rent: 375, u2Rent: 500, forcedSale: 250 },
  { name: 'Zoho', category: 'SaaS', cost: 300, baseRent: 150, u1Rent: 225, u2Rent: 300, forcedSale: 150 },
  { name: 'Flipkart', category: 'E-Commerce', cost: 300, baseRent: 150, u1Rent: 225, u2Rent: 300, forcedSale: 150 },
  { name: 'PhonePe', category: 'FinTech', cost: 400, baseRent: 200, u1Rent: 300, u2Rent: 400, forcedSale: 200 },
  { name: 'Qure.ai', category: 'HealthTech', cost: 400, baseRent: 200, u1Rent: 300, u2Rent: 400, forcedSale: 200 },
  { name: 'Physics Wallah', category: 'EdTech', cost: 200, baseRent: 100, u1Rent: 150, u2Rent: 200, forcedSale: 100 },
  { name: 'Postman', category: 'Developer Tools', cost: 300, baseRent: 150, u1Rent: 225, u2Rent: 300, forcedSale: 150 },
  { name: 'Cloudflare', category: 'Cybersecurity', cost: 400, baseRent: 200, u1Rent: 300, u2Rent: 400, forcedSale: 200 },
  { name: 'Ola Electric', category: 'CleanTech / Energy', cost: 500, baseRent: 250, u1Rent: 375, u2Rent: 500, forcedSale: 250 },
  { name: 'Addverb', category: 'Robotics & Automation', cost: 500, baseRent: 250, u1Rent: 375, u2Rent: 500, forcedSale: 250 },
];

export const BONUS_CARDS = [
  { title: 'Startup Grant', effect: '+₹300 Cash from the Bank.' },
  { title: 'Viral Growth', effect: '+₹200 Cash from the Bank.' },
  { title: 'Government Incentive', effect: '+₹200 Cash from the Bank.' },
  { title: 'Premium Deal', effect: 'Receive Cash equal to 50% of the purchase Cost of your most expensive Business (₹100 if you own none).' },
  { title: 'Founder Bonus', effect: 'Receive a Cash bonus based on portfolio size: 0 businesses = ₹50, 1 business = ₹100, 2 businesses = ₹200.' },
  { title: 'Lucky Break', effect: 'Roll 1 die again and receive roll × ₹100 Cash. *Reward roll is for cash only and does NOT move token.' },
];

export const CRISIS_CARDS = [
  { title: 'Tax Raid', effect: 'Pay −₹300 Cash to the Bank.' },
  { title: 'Market Crash', effect: 'Pay −₹200 Cash to the Bank.' },
  { title: 'Legal Trouble', effect: 'Pay −₹200 Cash to the Bank.' },
  { title: 'Burn Rate Spike', effect: 'Pay −₹100 Cash for every Business owned (₹0 if none).' },
  { title: 'Bad PR', effect: 'Pay −₹150 Cash to the Bank.' },
  { title: 'Investor Pullout', effect: 'Pay −₹400 Cash to the Bank.' },
];

export const SPACE_COUNTS = [
  { label: 'START', count: 1 },
  { label: 'Action', count: 3 },
  { label: 'Business', count: 10 },
  { label: 'Bonus Card', count: 4 },
  { label: 'Crisis Card', count: 4 },
  { label: 'Wildcard', count: 2 },
];

const ANCHOR = 'scroll-mt-32 lg:scroll-mt-6';

/* ---------- reusable pieces ---------- */

const Section: React.FC<{ n: number; id: string; title: string; children: React.ReactNode }> = ({ n, id, title, children }) => (
  <section id={id} aria-labelledby={`${id}-h`} className={`${ANCHOR} flex flex-col gap-5`}>
    <div className="border-b-4 border-neutral-950 pb-2">
      <p className="text-xs font-bold tracking-widest text-brand-gold">SECTION {String(n).padStart(2, '0')}</p>
      <h2 id={`${id}-h`} className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
    </div>
    {children}
  </section>
);

const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-neutral-50 text-brand-navy border-4 border-neutral-950 shadow-pixel p-4 flex flex-col gap-2">
    {title && <h3 className="text-base font-bold">{title}</h3>}
    {children}
  </div>
);

const Callout: React.FC<{ tone: 'warning' | 'important'; title: string; children: React.ReactNode }> = ({ tone, title, children }) => (
  <div
    role="note"
    className={`border-4 border-neutral-950 p-4 flex flex-col gap-2 ${
      tone === 'warning' ? 'bg-status-danger-bg text-status-danger-dark' : 'bg-status-warning-bg text-status-warning-text'
    }`}
  >
    <p className="font-extrabold">{tone === 'warning' ? '⚠ WARNING: ' : '★ IMPORTANT: '}{title}</p>
    <div className="text-brand-navy text-sm sm:text-base flex flex-col gap-2">{children}</div>
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-neutral-50 text-brand-navy border-4 border-neutral-950 p-3 text-center">
    <p className="text-2xl font-bold tabular-nums">{value}</p>
    <p className="text-xs font-semibold tracking-wide text-neutral-700">{label}</p>
  </div>
);


const Bullets: React.FC<{ items: string[]; ordered?: boolean }> = ({ items, ordered }) => {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 flex flex-col gap-1 text-sm sm:text-base`}>
      {items.map((i) => <li key={i}>{i}</li>)}
    </Tag>
  );
};

const Flow: React.FC<{ steps: string[] }> = ({ steps }) => (
  <ol className="flex flex-wrap items-center gap-2">
    {steps.map((s, i) => (
      <li key={`${s}-${i}`} className="flex items-center gap-2">
        <span className="bg-brand-gold text-brand-navy border-2 border-neutral-950 px-3 py-1.5 text-xs sm:text-sm font-bold">{s}</span>
        {i < steps.length - 1 && <span aria-hidden="true" className="text-white font-bold">→</span>}
      </li>
    ))}
  </ol>
);

const Table: React.FC<{ caption: string; head: string[]; rows: string[][] }> = ({ caption, head, rows }) => (
  <div className="overflow-x-auto border-4 border-neutral-950">
    <table className="w-full min-w-[22rem] text-left text-sm bg-neutral-50 text-brand-navy border-collapse">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="bg-brand-navy text-white">
          {head.map((h) => <th key={h} scope="col" className="p-2 font-bold">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]} className="border-t-2 border-neutral-300">
            {r.map((c, i) => (i === 0
              ? <th key={c} scope="row" className="p-2 font-bold">{c}</th>
              : <td key={c} className="p-2">{c}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CardGrid: React.FC<{ cards: { title: string; effect: string }[]; label: string }> = ({ cards, label }) => (
  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label={label}>
    {cards.map((c, i) => (
      <li key={c.title} className="bg-neutral-50 text-brand-navy border-4 border-neutral-950 p-3">
        <p className="text-xs font-bold text-neutral-700">CARD {i + 1}</p>
        <p className="font-bold">{c.title}</p>
        <p className="text-sm">{c.effect}</p>
      </li>
    ))}
  </ul>
);

const BoardImage: React.FC = () => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label="Physical board image not yet available" className="aspect-square w-full max-w-3xl mx-auto bg-brand-navy border-4 border-dashed border-brand-gold flex flex-col items-center justify-center text-center p-6 text-white gap-1">
        <p className="font-bold text-lg">Physical board image coming soon</p>
        <p className="text-sm">Add the board image at <code>public/board.png</code> to display it here.</p>
      </div>
    );
  }
  return (
    <figure className="flex flex-col gap-2">
      <a href={BOARD_IMAGE_SRC} target="_blank" rel="noopener noreferrer" className="block max-w-3xl mx-auto border-4 border-neutral-950 bg-white focus-visible:outline-4 focus-visible:outline-brand-gold">
        <img
          src={BOARD_IMAGE_SRC}
          alt="The physical STARTUPOLY board: a 24-space loop with START and Action B, C and D at the four corners and five spaces between each pair of corners."
          className="w-full h-auto"
          onError={() => setFailed(true)}
        />
      </a>
      <figcaption className="text-center text-sm text-white">Tap or click the board to open it full size in a new tab.</figcaption>
    </figure>
  );
};

/* ---------- page ---------- */

export const RulesPage: React.FC = () => (
  <div id="top" className="min-h-screen bg-brand-navy text-white">
    <header className="bg-brand-navy border-b-4 border-neutral-950 px-4 py-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-3">
        <Link to="/" className="self-start text-sm font-bold text-brand-gold hover:text-white focus-visible:outline-4 focus-visible:outline-brand-gold">← STARTUPOLY</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold">STARTUPOLY <span className="text-brand-gold">/ PLAYER HANDBOOK</span></h1>
        <p className="text-lg font-semibold">Official Rules &amp; Tournament Guidelines.</p>
        <p className="text-neutral-200">The authoritative guide to mechanics, economy, cards, and winning conditions.</p>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <Stat value="50" label="MINUTES" />
          <Stat value="6" label="TEAMS" />
          <Stat value="24" label="SPACES" />
        </div>
      </div>
    </header>

    <nav aria-label="Rulebook sections (mobile)" className="sticky top-0 z-30 bg-brand-navy border-b-4 border-neutral-950 lg:hidden">
      <ul className="flex gap-2 overflow-x-auto px-4 py-2">
        {SECTIONS.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <a href={`#${s.id}`} className="block bg-brand-gold text-brand-navy border-2 border-neutral-950 px-3 py-1.5 text-xs font-bold whitespace-nowrap focus-visible:outline-4 focus-visible:outline-white">
              {String(i + 1).padStart(2, '0')} {s.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
      <nav aria-label="Rulebook sections" className="hidden lg:block">
        <ul className="sticky top-6 flex flex-col gap-1">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block px-3 py-1.5 text-sm font-semibold text-white border-2 border-transparent hover:border-brand-gold focus-visible:outline-4 focus-visible:outline-brand-gold">
                {String(i + 1).padStart(2, '0')} · {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex flex-col gap-14 min-w-0">
        <Section n={1} id="overview" title="Game Overview">
          <p>STARTUPOLY is a live startup simulation board game where teams compete to manage capital, acquire businesses, collect rent, survive crises, and exit with the most cash.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Card title="Exactly 50 minutes"><p>Gameplay lasts exactly 50 minutes. When time expires, play stops immediately with no final turn or extra rolls.</p></Card>
            <Card title="Physical board first"><p>The physical 24-space board is the primary source of truth. The digital scoreboard tracks official state.</p></Card>
            <Card title="Who wins"><p>The eligible team with the highest remaining Cash wins. Any team in debt at the end scores ₹0 and cannot win.</p></Card>
          </div>
          <p className="bg-brand-gold text-brand-navy border-4 border-neutral-950 shadow-pixel p-4 text-center text-lg sm:text-2xl font-extrabold">
            WINNER = ELIGIBLE TEAM WITH HIGHEST REMAINING CASH
          </p>
        </Section>

        <Section n={2} id="getting-started" title="Getting Started">
          <p>Every team begins the match with:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat value="₹1,000" label="STARTING CASH" />
            <Stat value="0" label="BUSINESSES (MAX 2)" />
            <Stat value="₹0" label="STARTING DEBT" />
            <Stat value="1" label="TEAM TOKEN" />
          </div>
          <Card title="Turn order">
            <p>Turns follow strict round-robin order clockwise around the table.</p>
            <p className="font-bold">Example: Team 1 → Team 2 → Team 3 → Team 4 → Team 5 → Team 6 → Team 1</p>
          </Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <Card title="Maximum businesses per team"><p className="text-2xl font-bold">2 Businesses</p></Card>
            <Card title="Match duration"><p className="text-2xl font-bold">Exactly 50 minutes</p></Card>
          </div>
        </Section>

        <Section n={3} id="turns" title="How a Turn Works">
          <Flow steps={['ROLL', 'MOVE', 'RESOLVE LANDING', 'EXTRA ROLL IF 6', 'NEXT TEAM']} />
          <Card>
            <Bullets ordered items={[
              'Roll the die.',
              'Move the team token by the exact number rolled.',
              'Resolve the landing space immediately.',
              'If you roll a 6, take a free extra roll immediately after resolving the current landing.',
              'Pass the turn to the next team when no extra roll remains.',
            ]} />
          </Card>
          <Callout tone="warning" title="Three Sixes Rule">
            <p>Rolling three consecutive 6s in a single turn cancels the entire turn and completely reverses its effects! The team returns to where it began the turn.</p>
          </Callout>
          <Card title="Sharing spaces"><p>Multiple teams may occupy the same board space. Team tokens do not block movement.</p></Card>
        </Section>

        <Section n={4} id="board" title="The Board">
          <BoardImage />
          <h3 className="text-xl font-bold">Board overview</h3>
          <p>The physical board contains exactly 24 spaces in a square loop with 4 corners and 5 spaces between each corner.</p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" aria-label="Space distribution">
            {SPACE_COUNTS.map((s) => (
              <li key={s.label}><Stat value={String(s.count)} label={s.label.toUpperCase()} /></li>
            ))}
            <li><Stat value="24" label="TOTAL" /></li>
          </ul>

          <h3 className="text-xl font-bold">Corner spaces</h3>
          <Flow steps={['START', '5 spaces', 'Action B', '5 spaces', 'Action C', '5 spaces', 'Action D', '5 spaces', 'START']} />

          <h3 className="text-xl font-bold">Space types</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card title="START"><p>Collect ₹200 from the Bank upon reaching or passing. No Growth Bonus.</p></Card>
            <Card title="Business (10 spaces)"><p>Purchase unowned business or pay rent to owner. Maximum 2 per team.</p></Card>
            <Card title="Bonus Card (4 spaces)"><p>Draw Bonus Card determined by movement roll 1–6.</p></Card>
            <Card title="Crisis Card (4 spaces)"><p>Resolve Crisis Card determined by movement roll 1–6.</p></Card>
            <Card title="Action spaces (3 spaces)"><p>Corner spaces: Action B (Pitch), Action C (Tech Debt), Action D (Steal Talent).</p></Card>
            <Card title="Wildcard (2 spaces)"><p>Draw a Wildcard Chit and perform a quick mandatory physical/social task.</p></Card>
          </div>
        </Section>

        <Section n={5} id="businesses" title="Businesses & Upgrades">
          <h3 className="text-xl font-bold">Business directory</h3>
          <p>There are exactly 10 startup businesses on the board.</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Business directory">
            {BUSINESSES.map((b) => (
              <li key={b.name} className="bg-neutral-50 text-brand-navy border-4 border-neutral-950 p-3">
                <p className="font-extrabold">{b.name}</p>
                <p className="text-sm text-neutral-700">{b.category}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">Cost: ₹{b.cost} · Forced Sale: ₹{b.forcedSale}</p>
                <div className="text-xs mt-1 text-neutral-700">
                  Rent: Base ₹{b.baseRent} (50%) | U1 ₹{b.u1Rent} (75%) | U2 ₹{b.u2Rent} (100%)
                </div>
              </li>
            ))}
          </ul>

          <h3 className="text-xl font-bold">Rules &amp; Limits</h3>
          <Card>
            <Bullets items={[
              'Ownership limit: A team may own at most 2 Businesses at any time.',
              'Upgrades: Each Business can be upgraded up to 2 times.',
              'No passive income: Businesses do not generate automatic income each round; money is earned only as Rent when opponents land on them.',
              'Rent tiers: Base rent is 50%, Upgrade 1 rent is 75%, and Upgrade 2 rent is 100% of the Business’s original purchase cost.',
              'Forced sales: Allowed ONLY to cover a required payment or debt. Businesses sell for 50% of original cost; upgrades do not increase the sale price and their costs are not refunded.',
            ]} />
          </Card>

          <h3 className="text-xl font-bold">Rent calculation table</h3>
          <Table
            caption="Rent calculation tiers"
            head={['Level', 'Rent Percentage', 'Example (Cost ₹400)']}
            rows={[
              ['Base', '50% of original purchase cost', '₹200 Rent'],
              ['Upgrade 1', '75% of original purchase cost', '₹300 Rent'],
              ['Upgrade 2', '100% of original purchase cost', '₹400 Rent'],
            ]}
          />
        </Section>

        <Section n={6} id="special-spaces" title="Special Spaces">
          <h3 id="action-spaces" className={`text-xl font-bold ${ANCHOR}`}>Action spaces</h3>
          <div className="grid lg:grid-cols-3 gap-3">
            <Card title="ACTION B: Pitch to Investors">
              <Bullets items={[
                'Give a 30-second elevator pitch explaining why one owned Business is valuable.',
                'Mandatory if the team owns ≥1 Business. Refusal or failure forfeits the team’s next turn.',
                'If the team owns 0 Businesses, skip the action penalty-free.',
                'The Game Master judges whether the pitch passes.',
              ]} />
            </Card>
            <Card title="ACTION C: Tech Debt">
              <Bullets items={[
                'Landing team selects one Business.',
                'That selected Business temporarily earns ₹0 rent until that team’s next turn begins.',
              ]} />
            </Card>
            <Card title="ACTION D: Steal Talent">
              <Bullets items={[
                'Steal up to ₹100 available Cash from a chosen team.',
                'A target team with ₹0 is still a valid legal target (₹0 transferred).',
                'Does not force business sales and does not create debt.',
              ]} />
            </Card>
          </div>

          <h3 id="bonus-cards" className={`text-xl font-bold ${ANCHOR}`}>Bonus Cards</h3>
          <p>There are exactly four Bonus Card spaces and six possible Bonus Cards (determined by movement roll 1–6):</p>
          <CardGrid cards={BONUS_CARDS} label="Bonus Cards" />

          <h3 id="crisis-cards" className={`text-xl font-bold ${ANCHOR}`}>Crisis Cards</h3>
          <p>There are exactly four Crisis Card spaces and six possible Crisis Cards (determined by movement roll 1–6):</p>
          <CardGrid cards={CRISIS_CARDS} label="Crisis Cards" />

          <h3 id="wildcards" className={`text-xl font-bold ${ANCHOR}`}>Wildcards</h3>
          <p>Draw a Wildcard Chit and perform the quick physical or social challenge immediately before passing turn.</p>

          <Callout tone="important" title="Game Master authority">
            <p>For any edge cases or unresolved organizer questions (e.g. debt allocation priority between Bank and players, or targeting teams in debt recovery), ask the Game Master, who holds final authority.</p>
          </Callout>
        </Section>

        <Section n={7} id="start-rewards" title="START Space">
          <div className="bg-brand-gold text-brand-navy border-4 border-neutral-950 shadow-pixel p-5 flex flex-col gap-2">
            <p className="text-2xl font-extrabold">Reaching or passing START pays ₹200 Cash from the Bank.</p>
            <p className="font-bold text-base">There is NO Growth Bonus for owning businesses.</p>
          </div>
          <Card>
            <Bullets items={[
              'Reaching or passing START pays ₹200 from the Bank.',
              'There is no Growth Bonus or extra bonus for owning businesses upon passing START.',
              'If multiple rolls in one turn cause a team to pass START multiple times, the ₹200 is collected each time.',
            ]} />
          </Card>
        </Section>

        <Section n={8} id="cash-debt" title="Cash, Debt & Recovery">
          <Card title="Debt Recovery Procedure">
            <Bullets ordered items={[
              'Use available Cash first to pay any required payment.',
              'If Cash is insufficient, the team must sell Businesses under the forced-sale rule (50% of original cost; upgrades not refunded).',
              'If all Businesses are sold and debt remains, the team enters Debt Recovery.',
              'Debt Recovery does NOT eliminate the team immediately! The team continues playing.',
              'While in Debt Recovery, the team cannot buy Businesses or purchase upgrades.',
              'All incoming Cash (from START, cards, rent, etc.) goes toward paying off the debt first.',
              'The team must clear its debt before the 50 minutes end to remain eligible to win.',
              'A team still in debt when time expires scores ₹0 (bankrupt) and cannot win.',
            ]} />
          </Card>
        </Section>

        <Section n={9} id="winning" title="Winning the Game">
          <div className="bg-brand-gold text-brand-navy border-4 border-neutral-950 shadow-pixel p-5 flex flex-col gap-3">
            <p className="text-xl sm:text-2xl font-extrabold">The match winner is the eligible team with the highest remaining Cash.</p>
            <p className="font-bold">Gameplay lasts exactly 50 minutes. When time ends, play stops immediately with no final turn.</p>
          </div>
          <Card title="Tie-break order">
            <Bullets ordered items={[
              'Highest remaining Cash.',
              'If Cash is tied: Most Businesses owned.',
              'If still tied: Ask the Game Master.',
            ]} />
          </Card>
          <Callout tone="important" title="Debt Eligibility">
            <p>A team still in debt at the end scores ₹0 and cannot win.</p>
          </Callout>
        </Section>

        <Section n={10} id="quick-reference" title="Quick Reference">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card title="Economy">
              <Bullets items={['Starting Cash: ₹1,000.', 'Starting Debt: ₹0.', 'START payout: +₹200 Cash (no Growth Bonus).', 'Max Businesses per team: 2.', 'Max upgrades per Business: 2.', 'No passive income.']} />
            </Card>
            <Card title="Rent Tiers">
              <Bullets items={['Base: 50% of original cost.', 'Upgrade 1: 75% of original cost.', 'Upgrade 2: 100% of original cost.']} />
            </Card>
            <Card title="Forced Sales">
              <Bullets items={['Allowed only for debts/payments.', 'Sale price: 50% of original cost.', 'Upgrades: not refunded / no added value.']} />
            </Card>
            <Card title="Turns">
              <Bullets items={['Roll 6: Free extra roll.', 'Three 6s: Cancel turn and reverse effects.', 'Gameplay: Exactly 50 minutes.']} />
            </Card>
            <Card title="Action Spaces">
              <Bullets items={['Action B: 30s pitch for owned biz (GM judges).', 'Action C: Selected biz earns ₹0 rent until next turn.', 'Action D: Steal up to ₹100 Cash.']} />
            </Card>
            <Card title="Winning">
              <Bullets items={['Highest remaining Cash wins.', 'Debt at end = ₹0 score (cannot win).', 'Ties: Cash → Businesses → Game Master.']} />
            </Card>
          </div>
          <a href="#top" className="self-start text-sm font-bold text-brand-gold underline focus-visible:outline-4 focus-visible:outline-brand-gold">BACK TO TOP ↑</a>
        </Section>
      </main>
    </div>
  </div>
);
