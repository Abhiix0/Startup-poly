import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QuickActionsBar } from './QuickActionsBar';
import { RentDialog } from './RentDialog';
import { StealDialog } from './StealDialog';
import { CardDialog } from './CardDialog';
import { LoseFeatureDialog } from './LoseFeatureDialog';
import { ForcedSaleDialog } from './ForcedSaleDialog';
import { AdminConsoleView } from '../AdminConsoleView';
import { ToastProvider } from '../../../../ui';
import { TeamState } from '../../../../domain/quickActions';
import * as rpcModule from '../../../../data/rpc';

vi.mock('../../../../data/rpc', async () => {
  const actual = await vi.importActual('../../../../data/rpc');
  return {
    ...actual,
    rpcAdminSetTeamValues: vi.fn(),
    rpcAdminAdjust: vi.fn(),
    rpcAdminAddBusiness: vi.fn(),
    rpcAdminSetBusinessLevel: vi.fn(),
    rpcAdminRemoveBusiness: vi.fn(),
    rpcAdminSetBankrupt: vi.fn(),
  };
});

const mockTeams: TeamState[] = [
  {
    id: 'team-1',
    slot: 1,
    name: 'Alpha Rockets',
    color: '#E52521',
    cash: 1000,
    version: 3,
    businesses: [
      {
        business_key: 'saas',
        name: 'SaaS',
        level: 1,
        cost: 300,
      },
    ],
  },
  {
    id: 'team-2',
    slot: 2,
    name: 'Beta Builders',
    color: '#22B14C',
    cash: 50, // low cash for shortfall tests
    version: 2,
    businesses: [
      {
        business_key: 'edtech',
        name: 'EdTech',
        level: 0,
        cost: 200,
      },
    ],
  },
  {
    id: 'team-3',
    slot: 3,
    name: 'Gamma Guild',
    color: '#FFCC00',
    cash: 1200,
    version: 4,
    businesses: [],
  },
];

describe('QuickActionsBar', () => {
  it('renders all buttons and calls corresponding callbacks', () => {
    const onOpenRent = vi.fn();
    const onOpenBuy = vi.fn();
    const onOpenUpgrade = vi.fn();
    const onOpenForcedSale = vi.fn();
    const onOpenSteal = vi.fn();
    const onOpenBonusCard = vi.fn();
    const onOpenCrisisCard = vi.fn();
    const onOpenLoseFeature = vi.fn();

    render(
      <QuickActionsBar
        onOpenRent={onOpenRent}
        onOpenBuy={onOpenBuy}
        onOpenUpgrade={onOpenUpgrade}
        onOpenForcedSale={onOpenForcedSale}
        onOpenSteal={onOpenSteal}
        onOpenBonusCard={onOpenBonusCard}
        onOpenCrisisCard={onOpenCrisisCard}
        onOpenLoseFeature={onOpenLoseFeature}
      />
    );

    fireEvent.click(screen.getByText(/RENT \(R\)/i));
    expect(onOpenRent).toHaveBeenCalledTimes(1);

    // START is paid by the server on movement: there is no manual START action.
    expect(screen.queryByText(/START LAP/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/BUY \(B\)/i));
    expect(onOpenBuy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/UPGRADE \(U\)/i));
    expect(onOpenUpgrade).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/FORCED SALE/i));
    expect(onOpenForcedSale).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/STEAL TALENT/i));
    expect(onOpenSteal).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/BONUS CARD/i));
    expect(onOpenBonusCard).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/CRISIS CARD/i));
    expect(onOpenCrisisCard).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText(/LOSE FEATURE/i));
    expect(onOpenLoseFeature).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <QuickActionsBar
        disabled={true}
        onOpenRent={vi.fn()}
        onOpenBuy={vi.fn()}
        onOpenUpgrade={vi.fn()}
        onOpenForcedSale={vi.fn()}
        onOpenSteal={vi.fn()}
        onOpenBonusCard={vi.fn()}
        onOpenCrisisCard={vi.fn()}
        onOpenLoseFeature={vi.fn()}
      />
    );

    expect(screen.getByText(/RENT \(R\)/i).closest('button')).toBeDisabled();
    expect(screen.getByText(/BUY \(B\)/i).closest('button')).toBeDisabled();
  });
});

describe('RentDialog', () => {
  it('previews the rent and sends no amount to the server', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <RentDialog
        isOpen={true}
        onClose={onClose}
        teams={mockTeams}
        defaultPayerId="team-1"
        isTimeExpired={false}
        onSubmit={onSubmit}
      />
    );

    // Default payer is team-1, other team's business is edtech (L0 of team-2)
    // EdTech cost=200, L0 rent=100
    expect(screen.getByText(/EdTech \(L0\) • Owned by Beta Builders/i)).toBeInTheDocument();
    expect(screen.getByText(/Rent = 50% of ₹200 = ₹100/i)).toBeInTheDocument();

    // Confirm button
    const confirmBtn = screen.getByText(/CONFIRM RENT/i);
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    // Only identities and versions are sent: the server derives the owner and the rent.
    expect(onSubmit).toHaveBeenCalledWith({
      payerTeamId: 'team-1',
      businessKey: 'edtech',
      payerExpectedVersion: 3,
      ownerExpectedVersion: 2,
      note: undefined,
      requestId: expect.any(String),
    });
  });

  it('detects shortfall when payer has insufficient cash and disables submission', () => {
    const onSubmit = vi.fn();
    const onDoForcedSale = vi.fn();
    const onDeclareBankrupt = vi.fn();

    // Beta Builders has cash: 50. Landed on SaaS (L1 of Alpha Rockets), rent = 75% of 300 = 225
    render(
      <RentDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultPayerId="team-2"
        isTimeExpired={false}
        onSubmit={onSubmit}
        onDoForcedSale={onDoForcedSale}
        onDeclareBankrupt={onDeclareBankrupt}
      />
    );

    expect(screen.getByText(/PAYMENT SHORTFALL/i)).toBeInTheDocument();
    expect(screen.getByText(/short by/i)).toBeInTheDocument();

    // Confirm rent should be disabled
    expect(screen.getByText(/CONFIRM RENT/i).closest('button')).toBeDisabled();

    // Click Forced Sale button
    fireEvent.click(screen.getByText(/DO FORCED SALE FIRST/i));
    expect(onDoForcedSale).toHaveBeenCalledWith('team-2', 175);
  });
});

describe('StealDialog', () => {
  it('calculates min(100, victim.cash) and atomically transfers', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <StealDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultThiefId="team-1"
        isTimeExpired={false}
        onSubmit={onSubmit}
      />
    );

    // Victim is team-2 (has 50 cash)
    expect(screen.getByText(/takes ₹50 \(all Beta Builders had: ₹50\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/CONFIRM STEAL$/i));
    expect(onSubmit).toHaveBeenCalledWith({
      changes: [
        {
          team_id: 'team-1',
          cash_delta: 50,
          expected_version: 3,
        },
        {
          team_id: 'team-2',
          cash_delta: -50,
          expected_version: 2,
        },
      ],
      label: 'STEAL_TALENT',
      note: undefined,
      requestId: expect.any(String),
    });
  });
});

describe('CardDialog', () => {
  it('applies Bonus cards and Lucky Break roll', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CardDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultTeamId="team-1"
        defaultMode="BONUS"
        isTimeExpired={false}
        onSubmit={onSubmit}
      />
    );

    // Bonus #1: +₹300 Cash
    expect(screen.getAllByText(/Bonus #1: \+₹300 cash/i).length).toBeGreaterThan(0);

    // Switch to Card #6 (Lucky Break)
    fireEvent.click(screen.getByText('#6'));
    expect(screen.getByText(/Physical Die Roll \(1–6\):/i)).toBeInTheDocument();

    // Roll a 4
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(screen.getByText(/₹100 × roll 4 = \+₹400 cash/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/APPLY BONUS #6/i));
    expect(onSubmit).toHaveBeenCalledWith({
      changes: [
        {
          team_id: 'team-1',
          cash_delta: 400,
          expected_version: 3,
        },
      ],
      label: 'BONUS_CARD_6',
      note: undefined,
      requestId: expect.any(String),
    });
  });

  it('applies Crisis cards and blocks on cash shortfall', () => {
    const onSubmit = vi.fn();
    const onDoForcedSale = vi.fn();

    render(
      <CardDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultTeamId="team-2" // cash = 50
        defaultMode="CRISIS"
        isTimeExpired={false}
        onSubmit={onSubmit}
        onDoForcedSale={onDoForcedSale}
      />
    );

    // Crisis #1: −₹300 cash -> shortfall of 250
    expect(screen.getAllByText(/Crisis #1: −₹300 cash/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/PAYMENT SHORTFALL/i)).toBeInTheDocument();
    expect(screen.getByText(/APPLY CRISIS #1/i).closest('button')).toBeDisabled();

    fireEvent.click(screen.getByText(/DO FORCED SALE FIRST/i));
    expect(onDoForcedSale).toHaveBeenCalledWith('team-2', 250);
  });
});

describe('LoseFeatureDialog', () => {
  it('charges ₹200 cash to the Bank (Action C)', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LoseFeatureDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultTeamId="team-1"
        isTimeExpired={false}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/Tech Debt Strike: pay ₹200 cash to the Bank/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/CONFIRM −₹200/i));
    expect(onSubmit).toHaveBeenCalledWith({
      changes: [
        {
          team_id: 'team-1',
          cash_delta: -200,
          expected_version: 3,
        },
      ],
      label: 'LOSE_FEATURE',
      note: undefined,
      requestId: expect.any(String),
    });
  });
});

describe('ForcedSaleDialog', () => {
  it('displays businesses with resale payouts and allows selling', () => {
    const onSellBusiness = vi.fn().mockResolvedValue(undefined);

    render(
      <ForcedSaleDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultTeamId="team-2"
        shortfallTarget={250}
        isTimeExpired={false}
        onSellBusiness={onSellBusiness}
      />
    );

    expect(screen.getByText(/Shortfall Target: ₹250/i)).toBeInTheDocument();
    expect(screen.getByText(/EdTech/i)).toBeInTheDocument();
    expect(screen.getByText(/Forced-sale payout: \+₹100/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/SELL \(\+₹100\)/i));
    expect(onSellBusiness).toHaveBeenCalledWith({
      teamId: 'team-2',
      businessKey: 'edtech',
      expectedVersion: 2,
      note: undefined,
    });
  });

  it('shows bankruptcy button when team has no businesses', () => {
    const onDeclareBankrupt = vi.fn();

    render(
      <ForcedSaleDialog
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        defaultTeamId="team-3" // 0 businesses
        shortfallTarget={500}
        isTimeExpired={false}
        onSellBusiness={vi.fn()}
        onDeclareBankrupt={onDeclareBankrupt}
      />
    );

    expect(screen.getByText(/This team has no businesses to sell/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'DECLARE BANKRUPTCY' }));
    expect(onDeclareBankrupt).toHaveBeenCalledWith('team-3');
  });
});

describe('AdminConsoleView Keyboard Shortcuts', () => {
  const mockSnapshot: rpcModule.AdminRoomSnapshot = {
    room: {
      id: 'room-1',
      code: 'TEST88',
      status: 'ACTIVE',
      team_count: 3,
      started_at: '2026-09-21T10:00:00Z',
      ends_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      created_at: '2026-09-21T09:50:00Z',
      created_by: 'admin-1',
    },
    server_now: new Date().toISOString(),
    teams: [
      {
        id: 'team-1',
        slot: 1,
        name: 'Alpha Rockets',
        color: '#E52521',
        cash: 1000,
        debt: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: true,
        businesses: [
          {
            business_key: 'saas',
            name: 'SaaS',
            level: 0,
            cost: 300,
          },
        ],
      },
      {
        id: 'team-2',
        slot: 2,
        name: 'Beta Builders',
        color: '#22B14C',
        cash: 800,
        debt: 0,
        is_bankrupt: false,
        version: 1,
        tiebreak_order: null,
        claimed: true,
        businesses: [],
      },
    ],
    events: [],
  };

  it('opens rent dialog on R and closes on Escape', () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <AdminConsoleView
            snapshot={mockSnapshot}
            onRefetch={vi.fn().mockResolvedValue(undefined)}
            connection="LIVE"
            lastUpdated="Just now"
          />
        </ToastProvider>
      </MemoryRouter>
    );

    // Press 'r'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    });
    expect(screen.getByText(/RECORD RENT PAYMENT/i)).toBeInTheDocument();

    // Press 'Escape'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.queryByText(/RECORD RENT PAYMENT/i)).not.toBeInTheDocument();
  });
});
