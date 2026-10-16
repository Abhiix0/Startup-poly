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
  { id: 'start-rewards', title: 'START Rewards' },
  { id: 'cash-cv', title: 'Cash, CV & Bankruptcy' },
  { id: 'winning', title: 'Winning the Game' },
  { id: 'quick-reference', title: 'Quick Reference' },
] as const;

export const BUSINESSES = [
  { name: 'OpenAI', category: 'AI / DeepTech', cost: 500, cv: 250 },
  { name: 'Zoho', category: 'SaaS', cost: 300, cv: 180 },
  { name: 'Flipkart', category: 'E-Commerce', cost: 300, cv: 180 },
  { name: 'PhonePe', category: 'FinTech', cost: 400, cv: 200 },
  { name: 'Qure.ai', category: 'HealthTech', cost: 400, cv: 200 },
  { name: 'Physics Wallah', category: 'EdTech', cost: 200, cv: 150 },
  { name: 'Postman', category: 'Developer Tools', cost: 300, cv: 190 },
  { name: 'Cloudflare', category: 'Cybersecurity', cost: 400, cv: 220 },
  { name: 'Ola Electric', category: 'CleanTech / Energy', cost: 500, cv: 240 },
  { name: 'Addverb', category: 'Robotics & Automation', cost: 500, cv: 250 },
];

export const BONUS_CARDS = [
  { title: 'Startup Grant', effect: '+₹300 Cash' },
  { title: 'Viral Growth', effect: '+300 CV' },
  { title: 'Government Incentive', effect: '+₹200 Cash and +200 CV' },
  { title: 'Premium Deal', effect: 'Cash equal to the purchase Cost of the most expensive Business currently owned; ₹0 if none.' },
  { title: 'Founder Bonus', effect: '+₹100 Cash for every Business owned' },
  { title: 'Lucky Break', effect: 'Roll the die again and receive ₹100 multiplied by the number rolled.' },
];

export const CRISIS_CARDS = [
  { title: 'Tax Raid', effect: '−₹300 Cash' },
  { title: 'Market Crash', effect: '−300 CV' },
  { title: 'Legal Trouble', effect: '−₹200 Cash and −200 CV' },
  { title: 'Burn Rate Spike', effect: '−₹100 Cash for every Business owned; ₹0 if none.' },
  { title: 'Bad PR', effect: '−₹100 Cash and −200 CV' },
  { title: 'Investor Pullout', effect: '−₹500 Cash' },
];

export const SPACE_COUNTS = [
  { label: 'START', count: 1 },
  { label: 'Action', count: 3 },
  { label: 'Business', count: 10 },
  { label: 'Bonus Card', count: 4 },
  { label: 'Crisis Card', count: 4 },
  { label: 'Wildcard', count: 2 },
];

const FORMULA = 'TOTAL COMPANY VALUE = CASH + COMPANY VALUE';
const ANCHOR = 'scroll-mt-32 lg:scroll-mt-6';
const LINK = 'underline font-bold focus-visible:outline-4 focus-visible:outline-brand-gold';

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

const Formula: React.FC = () => (
  <p className="bg-brand-gold text-brand-navy border-4 border-neutral-950 shadow-pixel p-4 text-center text-lg sm:text-2xl font-extrabold">
    {FORMULA}
  </p>
);

const Details: React.FC<{ summary: string; children: React.ReactNode }> = ({ summary, children }) => (
  <details className="group bg-neutral-50 text-brand-navy border-4 border-neutral-950">
    <summary className="cursor-pointer select-none p-3 font-bold flex justify-between gap-2 focus-visible:outline-4 focus-visible:outline-brand-gold">
      {summary}
      <span aria-hidden="true" className="group-open:rotate-180">▼</span>
    </summary>
    <div className="p-3 pt-0 text-sm sm:text-base flex flex-col gap-2">{children}</div>
  </details>
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
        <h1 className="text-3xl sm:text-4xl font-extrabold">STARTUPOLY <span className="text-brand-gold">/ RULEBOOK</span></h1>
        <p className="text-lg font-semibold">Know the game. Build your empire.</p>
        <p className="text-neutral-200">A guide to the rules, rewards, and winning conditions of STARTUPOLY.</p>
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
          <p>STARTUPOLY is a live startup simulation board game in which teams compete to build the most valuable company portfolio.</p>
          <p>Teams physically move around a startup-themed board, acquire businesses, upgrade them, generate Company Value (CV), pay and collect rent, receive bonuses, survive crises, and complete special actions.</p>
          <p>The game combines strategy, entrepreneurship, risk/reward decisions, business portfolio building, quick decision-making, team interaction, and physical gameplay.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Card title="Exactly 50 minutes"><p>Gameplay lasts exactly 50 minutes.</p></Card>
            <Card title="Physical board first"><p>The physical board is the main gameplay interface. The live digital scoreboard tracks game state.</p></Card>
            <Card title="Who wins"><p>The active team with the highest Total Company Value at the end wins.</p></Card>
          </div>
          <Formula />
        </Section>

        <Section n={2} id="getting-started" title="Getting Started">
          <p>Every team starts with:</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat value="₹1,000" label="CASH" />
            <Stat value="0" label="COMPANY VALUE" />
            <Stat value="0" label="BUSINESSES" />
            <Stat value="0" label="UPGRADES" />
            <Stat value="1" label="TEAM TOKEN" />
          </div>
          <Card title="Turn order">
            <p>Team order is determined before gameplay begins. Turns follow strict round-robin order.</p>
            <p className="font-bold">Example: Team 1 → Team 2 → Team 3 → Team 4 → Team 5 → Team 6 → Team 1</p>
          </Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <Card title="Maximum businesses per team"><p className="text-2xl font-bold">2</p></Card>
            <Card title="Match duration"><p className="text-2xl font-bold">50 minutes of gameplay</p></Card>
          </div>
        </Section>

        <Section n={3} id="turns" title="How a Turn Works">
          <Flow steps={['ROLL', 'MOVE', 'RESOLVE LANDING', 'EXTRA ROLL IF APPLICABLE', 'NEXT TEAM']} />
          <Card>
            <Bullets ordered items={[
              'Roll the die.',
              'Move the team token by exactly the number rolled.',
              'Resolve the landing space immediately.',
              'If the roll was 6, roll again.',
              'Resolve the new landing before rolling again.',
              'Continue until no additional roll is granted.',
              'Pass the turn to the next team.',
            ]} />
          </Card>
          <Callout tone="warning" title="Three Sixes Rule">
            <p>If a team rolls three consecutive 6s during the same turn, the entire turn is cancelled. The team returns to its position before the turn began, and all effects from that cancelled turn are reversed.</p>
            <p className="font-bold">Reversal includes:</p>
            <Bullets items={['Movement.', 'Cash changes.', 'CV changes.', 'Business purchases.', 'Upgrades.', 'Rent payments and collections.', 'Card rewards and penalties.', 'Action effects.']} />
          </Callout>
          <Card title="Sharing spaces"><p>Multiple teams may occupy the same board space. Team tokens do not block movement.</p></Card>
        </Section>

        <Section n={4} id="board" title="The Board">
          <BoardImage />
          <h3 className="text-xl font-bold">Board overview</h3>
          <p>The physical board contains exactly 24 spaces.</p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" aria-label="Space distribution">
            {SPACE_COUNTS.map((s) => (
              <li key={s.label}><Stat value={String(s.count)} label={s.label.toUpperCase()} /></li>
            ))}
            <li><Stat value="24" label="TOTAL" /></li>
          </ul>

          <h3 className="text-xl font-bold">Board architecture</h3>
          <p>The four corners are START, Action B, Action C and Action D. There are exactly five normal spaces between each pair of corners.</p>
          <Flow steps={['START', '5 spaces', 'Action B', '5 spaces', 'Action C', '5 spaces', 'Action D', '5 spaces', 'START']} />

          <h3 className="text-xl font-bold">Space types</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card title="START"><p>Cash reward and potential Growth Bonus. <a className={LINK} href="#start-rewards">See START Rewards</a>.</p></Card>
            <Card title="Business"><p>Purchase an unowned business, or pay rent when landing on another team&apos;s business. <a className={LINK} href="#businesses">See Businesses</a>.</p></Card>
            <Card title="Bonus Card"><p>Receive a bonus determined by the card drawn. <a className={LINK} href="#bonus-cards">See Bonus Cards</a>.</p></Card>
            <Card title="Crisis Card"><p>Resolve the applicable penalty. <a className={LINK} href="#crisis-cards">See Crisis Cards</a>.</p></Card>
            <Card title="Action spaces"><p>Perform the action associated with Action B, C, or D. <a className={LINK} href="#action-spaces">See Action Spaces</a>.</p></Card>
            <Card title="Wildcard"><p>Draw a Wildcard Chit and complete the mandatory task. <a className={LINK} href="#wildcards">See Wildcards</a>.</p></Card>
          </div>

          <Callout tone="important" title="The physical board is the source of truth">
            <p>The physical board decides:</p>
            <Bullets items={['Movement.', 'Landing spaces.', 'Team tokens.', 'Business ownership markers.', 'Cards and chits.', 'Physical player interaction.']} />
            <p>The digital scoreboard tracks game state. It does not replace the physical board.</p>
          </Callout>
          <Card title="Multiple teams"><p>Multiple teams may occupy the same space. Team tokens do not block movement.</p></Card>
          <Card title="START">
            <p>Reaching or passing START grants +₹200 Cash and a Growth Bonus based on the number of businesses owned: 0 businesses = no additional CV, 1 = +200 CV, 2 = +500 CV.</p>
          </Card>
        </Section>

        <Section n={5} id="businesses" title="Businesses & Upgrades">
          <h3 className="text-xl font-bold">Business directory</h3>
          <p>There are exactly 10 Business spaces.</p>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-label="Business directory">
            {BUSINESSES.map((b) => (
              <li key={b.name} className="bg-neutral-50 text-brand-navy border-4 border-neutral-950 p-3">
                <p className="font-extrabold">{b.name}</p>
                <p className="text-sm text-neutral-700">{b.category}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">Cost: ₹{b.cost} · Initial CV: +{b.cv}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-neutral-200">Company names are used for educational/event simulation purposes and do not represent sponsorship, endorsement, or affiliation.</p>

          <h3 className="text-xl font-bold">Buying businesses</h3>
          <Card>
            <p>When a team lands on an unowned Business space, it may purchase the business:</p>
            <Bullets ordered items={[
              'Pay the listed cost to the Bank.',
              'Mark the business as owned by the team.',
              "Add its Initial CV to the team's Company Value.",
            ]} />
            <p>If the team declines, the business remains unowned and no payment or CV is awarded. Maximum businesses per team: 2. There is no bidding system.</p>
          </Card>

          <h3 className="text-xl font-bold">Rent</h3>
          <p>When a team lands on another team&apos;s business, the visiting team pays rent to the owner. Rent is calculated from the business&apos;s original purchase cost.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat value="50%" label="BASE" />
            <Stat value="75%" label="UPGRADE 1" />
            <Stat value="100%" label="UPGRADE 2" />
          </div>
          <p>The owner receives the rent payment and gains the corresponding landing CV according to the business&apos;s current upgrade level.</p>

          <h3 className="text-xl font-bold">Upgrades</h3>
          <p>Each business can have a maximum of two upgrades.</p>
          <Table
            caption="Upgrade levels"
            head={['Level', 'Upgrade cost', 'CV added', 'Rent']}
            rows={[
              ['Base', '₹0', 'Base CV', '50% of original cost'],
              ['Upgrade 1', 'To be confirmed', '+300 CV', '75% of original cost'],
              ['Upgrade 2', 'To be confirmed', '+400 CV', '100% of original cost'],
            ]}
          />
          <p>A team may upgrade only a business it owns and only while the business is below Upgrade 2. The applicable upgrade cost must be paid to the Bank.</p>

          <h3 id="selling" className={`text-xl font-bold ${ANCHOR}`}>Selling / Bankruptcy</h3>
          <Callout tone="important" title="Businesses cannot be voluntarily sold">
            <p>Selling occurs only when a team cannot pay a required payment.</p>
          </Callout>
          <Details summary="Forced-sale procedure">
            <Bullets ordered items={[
              'Use available Cash first.',
              'If Cash is insufficient, the team chooses Businesses to sell.',
              'Each sold Business returns to the Bank.',
              "The team receives that Business's original purchase Cost.",
              'Upgrade costs are not refunded.',
              'Upgrade value is not added to the sale price.',
              'Previously earned CV is not removed.',
              'The Business returns to Base level when available again.',
            ]} />
            <p className="font-bold">If the team has no Businesses left and still cannot pay the required amount, the team is eliminated and is not eligible to win.</p>
          </Details>
        </Section>

        <Section n={6} id="special-spaces" title="Special Spaces">
          <h3 id="action-spaces" className={`text-xl font-bold ${ANCHOR}`}>Action spaces</h3>
          <div className="grid lg:grid-cols-3 gap-3">
            <Card title="ACTION B: Pitch to Investors">
              <Bullets items={[
                'The team gives a short pitch explaining why one owned Business is valuable, useful, promising, or worth investing in.',
                'If the team owns at least one Business, the pitch is mandatory.',
                'If the team refuses or fails to perform it, the team loses its next turn.',
                'If the team owns zero Businesses, skip the action with no penalty.',
              ]} />
            </Card>
            <Card title="ACTION C: Lose the Feature">
              <Bullets items={['The team immediately loses 200 CV.', 'Company Value cannot fall below zero.']} />
            </Card>
            <Card title="ACTION D: Steal Talent">
              <Bullets items={[
                'Choose any other team and take ₹100 Cash from it.',
                'If the team has less than ₹100, take whatever Cash it currently has.',
                'If it has ₹0, the action still succeeds and ₹0 is transferred.',
                'No Business is transferred.',
                'This action does not trigger a Business sale.',
              ]} />
            </Card>
          </div>

          <h3 id="bonus-cards" className={`text-xl font-bold ${ANCHOR}`}>Bonus Cards</h3>
          <p>There are exactly four Bonus Card spaces and six possible Bonus Cards.</p>
          <CardGrid cards={BONUS_CARDS} label="Bonus Cards" />
          <Details summary="Lucky Break: second roll rules">
            <p>Lucky Break&apos;s second roll is reward-only:</p>
            <Bullets items={['It does not cause movement.', 'It does not trigger another board space.', 'It does not create another Lucky Break.']} />
          </Details>

          <h3 id="crisis-cards" className={`text-xl font-bold ${ANCHOR}`}>Crisis Cards</h3>
          <p>There are exactly four Crisis Card spaces and six possible Crisis Cards.</p>
          <CardGrid cards={CRISIS_CARDS} label="Crisis Cards" />
          <Callout tone="important" title="Crisis penalties">
            <p>Company Value cannot fall below zero. Crisis Cards do not automatically force a Business sale. If a resulting payment cannot be made, the normal <a className={LINK} href="#selling">forced-sale rules</a> apply.</p>
          </Callout>

          <h3 id="wildcards" className={`text-xl font-bold ${ANCHOR}`}>Wildcards</h3>
          <p>There are exactly two Wildcard spaces. When a team lands on one:</p>
          <Card>
            <Bullets ordered items={['Draw one Wildcard Chit.', 'One team member performs the task.', 'The task is mandatory.', 'Complete it before continuing.']} />
          </Card>
          <Details summary="What Wildcard tasks look like">
            <p>Wildcard tasks must be:</p>
            <Bullets items={['Quick, funny, or engaging.', 'Self-contained.', "Independent of the team's Businesses.", 'Free of Cash, CV, or strategic advantages.']} />
            <p>Their purpose is to introduce unpredictable, social, physical, or entertaining moments.</p>
          </Details>
        </Section>

        <Section n={7} id="start-rewards" title="START Rewards">
          <div className="bg-brand-gold text-brand-navy border-4 border-neutral-950 shadow-pixel p-5 flex flex-col gap-2">
            <p className="text-2xl font-extrabold">Every time a team reaches or passes START:</p>
            <Bullets items={['+₹200 Cash.', 'A Growth Bonus based on the number of Businesses owned.']} />
          </div>
          <Table
            caption="START Growth Bonus"
            head={['Businesses owned', 'Growth Bonus']}
            rows={[['0', 'No additional CV'], ['1', '+200 CV'], ['2', '+500 CV']]}
          />
          <p>Maximum businesses per team: 2.</p>
          <Card>
            <Bullets items={[
              'The Growth Bonus is applied every time the team reaches or passes START.',
              'Landing exactly on START counts as reaching START.',
              'If a team crosses START multiple times because of additional rolls, the reward applies each time.',
            ]} />
          </Card>
        </Section>

        <Section n={8} id="cash-cv" title="Cash, Company Value & Bankruptcy">
          <div className="grid sm:grid-cols-2 gap-3">
            <Card title="CASH">
              <p>Used for:</p>
              <Bullets items={['Buying businesses.', 'Upgrading businesses.', 'Paying rent.', 'Paying penalties.', 'Handling other cash-based events.']} />
            </Card>
            <Card title="COMPANY VALUE (CV)"><p>Represents the value of the team&apos;s startup portfolio.</p></Card>
          </div>
          <Formula />
          <Card>
            <Bullets items={[
              'Company Value cannot fall below zero.',
              'Required payments use available Cash first.',
              'If Cash is insufficient, the team chooses Businesses to sell under the forced-sale rules.',
              'Upgrade costs are not refunded.',
              'Previously earned CV is not removed when a Business is sold.',
              'A team unable to pay even after selling all its Businesses is eliminated.',
              'Eliminated teams are not eligible to win.',
            ]} />
            <p>Full procedure: <a className={LINK} href="#selling">Selling / Bankruptcy</a> in Section 05.</p>
          </Card>
        </Section>

        <Section n={9} id="winning" title="Winning the Game">
          <div className="bg-brand-gold text-brand-navy border-4 border-neutral-950 shadow-pixel p-5 flex flex-col gap-3">
            <p className="text-xl sm:text-2xl font-extrabold">The team with the highest Total Company Value at the end of gameplay wins.</p>
            <p className="text-lg sm:text-2xl font-extrabold">{FORMULA}</p>
            <p className="font-bold">Gameplay lasts exactly 50 minutes. Setup and wrap-up periods are not part of gameplay time.</p>
          </div>
          <Card title="At the end of 50 minutes">
            <Bullets items={[
              'Stop gameplay immediately.',
              'Do not allow an additional roll.',
              'Do not allow an extra final turn.',
              'Freeze the current game state.',
              'Confirm the Total Company Value of active teams.',
              'Apply tie-breakers if necessary.',
            ]} />
          </Card>
          <Card title="Tie-breakers">
            <Bullets ordered items={[
              'Higher Cash wins.',
              'If Cash is tied, the team with more Businesses wins.',
              'If still tied, each tied team gives a 30-second pitch to the judges, who determine the winner.',
            ]} />
          </Card>
          <Callout tone="important" title="Eligibility">
            <p>Eliminated or bankrupt teams are not eligible to win.</p>
          </Callout>
        </Section>

        <Section n={10} id="quick-reference" title="Quick Reference">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card title="Economy">
              <Bullets items={['Starting Cash: ₹1,000.', 'Starting CV: 0.', 'START Cash reward: +₹200.', 'Maximum Businesses per team: 2.', 'Maximum upgrades per Business: 2.', 'Company Value cannot fall below 0.']} />
            </Card>
            <Card title="START Growth Bonus">
              <Bullets items={['0 Businesses: No additional CV.', '1 Business: +200 CV.', '2 Businesses: +500 CV.']} />
            </Card>
            <Card title="Rent">
              <Bullets items={['Base: 50% of original purchase cost.', 'Upgrade 1: 75% of original purchase cost.', 'Upgrade 2: 100% of original purchase cost.']} />
            </Card>
            <Card title="Upgrades">
              <Bullets items={['Upgrade 1: +300 CV.', 'Upgrade 2: +400 CV.', 'Both upgrade costs: To be confirmed.']} />
            </Card>
            <Card title="Turns">
              <Bullets items={['Rolling 6: Extra roll.', 'Three consecutive 6s: Entire turn cancelled and its effects reversed.', 'Resolve each landing before rolling again.', 'Multiple teams can occupy the same space.']} />
            </Card>
            <Card title="Board">
              <Bullets items={['Total spaces: 24.', 'START: 1.', 'Action spaces: 3.', 'Business spaces: 10.', 'Bonus Card spaces: 4.', 'Crisis Card spaces: 4.', 'Wildcard spaces: 2.']} />
            </Card>
            <Card title="Match">
              <Bullets items={['Gameplay duration: 50 minutes.', 'Teams per match: 6.', 'Players per team: 4–5.', 'Total matches during the event: 10.']} />
            </Card>
          </div>
          <a href="#top" className="self-start text-sm font-bold text-brand-gold underline focus-visible:outline-4 focus-visible:outline-brand-gold">BACK TO TOP ↑</a>
        </Section>
      </main>
    </div>
  </div>
);
