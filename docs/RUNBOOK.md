# STARTUPOLY Event Runbook & Tech Runner Guide

> **Event Day Field Guide**  
> *Target Audience: Tech Runners, Game Masters, and Tournament Scorekeepers*  
> *Document Version: 1.0 (Production)*

---

## 1. System Overview & Roles

STARTUPOLY is a **physical board game** featuring a real-time, server-authoritative live scoreboard. 

- **Event Admin (Laptop)**: 1 operator per room operating on a laptop/desktop ($\ge 1024\text{ px}$). Authenticated with admin email/password. Records board transactions, controls the 50:00 match clock, resolves ties, and finalizes results.
- **Team Scoreboards (Phones)**: 1 phone per team (5–6 teams per match). Anonymous, strictly read-only display showing authoritative cash, any outstanding debt, clock, and owned businesses.
- **Open-ground operation**: No projector or shared screen is required. The admin laptop runs the control room, while each team uses its own phone for its private scoreboard.

---

## 2. Pre-Event Checklist (T−60 to T−15 min)

Complete this checklist at least 30 minutes before players enter the room:

- [ ] **Venue Wi-Fi & Hotspot Verification**: Connect the admin laptop to venue Wi-Fi. Verify low-latency connection (< 150 ms) to Supabase. Ensure an organizer's mobile 5G hotspot is on standby as immediate failover.
- [ ] **Admin Hardware**: Laptop plugged into AC mains power; display timeout disabled; external mouse connected for rapid data entry.
- [ ] **Open-ground setup**: Confirm the admin laptop is charged and each team has a phone; no projector or shared screen is required.
- [ ] **Team PIN Cards Prepared**: Print or handwrite 6 team index cards with:
  - Team Slot Number (#1 to #6)
  - Team Name
  - 4-Digit Secret PIN (retrieved from the Admin Lobby view)
- [ ] **Run Production Health Check**:
  ```bash
  npx tsx scripts/verify-prod.ts --url=https://<your-project>.supabase.co --key=<anon-key>
  ```
  *Ensure all 6 permission and security checks pass.*
- [ ] **Paper Fallback Scoreboard**: Have 2 copies of the Paper Fallback Sheet (Section 5) and 2 pens on the scorer's table.

---

## 3. Per-Match Procedure (Step-by-Step)

### Step 1: Create Room & Configure Teams
1. Navigate to `/admin` and log in with your admin credentials.
2. Select team count: **5 Teams** or **6 Teams** (official tournament formats).
3. Confirm team names and distinct colors. Click **"CREATE TOURNAMENT ROOM"**.

### Step 2: Open Lobby & Share Room Code
1. Click **"OPEN LOBBY"**.
2. The large 6-character room code (e.g. `K9X2P4`) appears in the center card.
3. Share the code directly with captains or on printed team cards; players do not depend on a projector or shared screen.

### Step 3: Distribute Secret PINs
1. Look at the **"TEAM CONNECTIONS & SECRET PINS"** grid in the admin console.
2. Note each team's unique 4-digit PIN.
3. Hand each team captain their corresponding index card containing their slot, team name, and PIN.

### Step 4: Confirm All Teams Joined
1. Team captains open their phone browser and navigate to `/join`.
2. Captains input:
   - **Step 1**: 6-character Room Code.
   - **Step 2**: Select their team slot.
   - **Step 3**: Enter their secret 4-digit PIN.
3. In the admin console, watch the status pills update from `WAITING` (yellow) to `ACTIVE` (green pulse).
4. Verify all 5 or 6 teams show `CONNECTED`.
5. If a team accidentally claims the wrong slot, click **"RELEASE"** on that team's card and have them rejoin.

### Step 5: Start Match on Game Master's Signal
1. The Game Master gives the 3-2-1 countdown.
2. Click **"START GAME (50:00)"**. 
3. The authoritative countdown immediately starts on the server and synchronizes across the admin laptop and all team phones within 500 ms.

### Step 6: Record Live Board Transactions
During play, use the quick-action calculator dialogs at the bottom of the admin console for maximum entry speed:

| Event on Physical Board | Admin Action | Keyboard Shortcut / Flow |
|---|---|---|
| **Rent Payment** | Click `RENT (PAY)` | Select the paying team and the landed business. The server finds the owner and charges 50% / 75% / 100% of the business's cost by level; the payer's token must be on that business's space. Click Confirm. |
| **Pass START** | Move the token on the **Live Board** (1 to 6 steps) | Reaching or passing START credits ₹200 automatically in the same move, once per move (landing exactly on START counts). Debt is cleared first. There is no manual START action. |
| **Acquire Business** | Click `BUY BIZ` | Select business (1 of 10) from catalog. The team's token must be on that business's space; the cost is charged. A team may own at most 2 businesses and cannot buy while in debt. A free manual entry needs a note and is logged as a correction. |
| **Upgrade Business** | Click `UPGRADE` | Select owned business. Level 0 → 1 or Level 1 → 2. Charges the upgrade fee (cost 200: ₹100 then ₹150; 300: ₹150 / ₹200; 400: ₹200 / ₹250; 500: ₹250 / ₹300). Not allowed while the team is in debt. |
| **Crisis / Bonus Card** | Click `CARD` | Select `BONUS` or `CRISIS`. Select preset card amount or enter custom amount. |
| **Forced Sale** | Click `FORCED SALE` | Sells an owned business back to the Bank for 50% of its original cost (upgrades add nothing); the proceeds clear any debt first. Use it when a team cannot cover a required payment. |
| **Steal Talent** | Click `STEAL TALENT` | Target team loses ₹100; active team gains ₹100. |

*Team Selection Tip*: Press number keys `1`–`6` or Arrow keys on your laptop keyboard to immediately switch active teams without using the trackpad.

### Step 7: 50:00 GAME OVER
1. When the countdown reaches `00:00`, the server transitions the room to `TIME_EXPIRED`.
2. The UI flashes `GAME OVER` on all team phones.
3. The Game Master announces: *"Pencils and dice down! The match is over."*
4. All real-time phone dashboards freeze at match-end values.

### Step 8: Reconciliation Window (5 Minutes)
1. In `TIME_EXPIRED` mode, the admin console remains interactive for post-match adjustments.
2. **Mandatory Audit Note**: Any edit made during this window requires a brief explanatory note (e.g., *"Reconcile final dice roll rent"*).
3. If an edit is attempted without a note, the system prompts for one.

### Step 9: Ranking and Ties
The standings rank teams in this order:
1. Highest remaining Cash.
2. If Cash is equal: highest total original purchase cost of the businesses still owned.
3. If still equal: most upgrades across owned businesses.
4. If all three are equal, the teams **share the rank**. There is no pitch or Game Master tie-break entry.

A team still in debt when time expires is ineligible: it ranks below every eligible team and cannot win. If the top teams share rank 1 the match has no single winner (the history page shows no winner name).

### Step 10: Finalize & Display Podium
1. Click **"FINALIZE MATCH"**.
2. The official results are written permanently to `final_results`.
3. The presentation podium reveals:
   - 🥇 **1st Place (Winner)** with golden animated trophy
   - 🥈 **2nd Place (Silver)**
   - 🥉 **3rd Place (Bronze)**
   - Full standings table with Cash, owned business cost, upgrades, and debt status.
4. The Game Master announces the podium from the admin laptop; teams can view their own final result on their phones.

### Step 11: Start Next Match
1. Click **"NEXT MATCH"** at the top right of the screen.
2. The completed match is securely archived under `/admin/history`.
3. Return to Step 1 for the subsequent match.

---

## 4. Troubleshooting & Incident Matrix

| Symptom | Probable Cause | Immediate Remediation |
|---|---|---|
| **Phone says "Code, team or PIN didn't match"** | Typo in 6-char code, wrong slot selected, or incorrect 4-digit PIN. | Verify the room code from the admin laptop or the team card. Check the team's PIN in the Admin Lobby grid. Ensure team didn't choose a slot already claimed by another phone. |
| **Phone captain closed browser or lost session** | Mobile Safari / Chrome auto-refreshed or closed tab. | Have captain reopen `/join`. Anonymous Supabase session persists in `localStorage`; captain re-enters code, slot, and PIN to re-link immediately. |
| **Admin laptop battery died or crashed** | Hardware or power failure. | Plug laptop into AC power. Re-open browser and log in at `/admin`. The system automatically redirects to `/admin/room/[id]` because all room state lives in PostgreSQL. No data is lost. |
| **Venue Wi-Fi drops completely** | Router/ISP failure. | 1. Admin turns on phone cellular hotspot.<br>2. Reconnect laptop to hotspot.<br>3. Admin console displays red `OFFLINE` banner until reconnected, then syncs live snapshot automatically. |
| **Wrong transaction amount entered** | Scorer typo during rapid entry. | 1. Select the affected team.<br>2. In the Cash editor, type the corrected balance.<br>3. Provide an audit note describing the correction.<br>4. Click **UPDATE**. |
| **Version Mismatch / Conflict Dialog appears** | Two admins tried editing the same team simultaneously. | The Conflict Dialog shows: *"Server was modified by another operator"*. Click **"DISCARD MY CHANGES"** to inspect current values, then re-apply if appropriate. |
| **Phone says "Too many tries — wait N seconds"** | The join throttle tripped: more than 5 wrong PINs from one phone, 10 for one team, or 30 for one room in a minute. | Wait for the countdown (60 s). Read the PIN again from the Admin Lobby grid before retrying. A team under attack rejects even the right PIN until the minute passes. |
| **Phone says "This team is already connected"** | Another phone already holds the slot (or the captain's old session still does). | Click **RELEASE** on that team's card, then have the captain rejoin with the PIN. |
| **Console says "Connection lost. This may or may not have been saved"** | The network dropped while a change was in flight; the outcome is unknown. | Do not re-type it blindly. Read the refreshed values: if the change is there, you are done. If not, repeat the same action: the console reuses the same request id, so it cannot apply twice. |
| **Abort says the clock has run out** | The 50:00 deadline passed, so the match is finished. | Do not abort. Use the reconciliation window, then **FINALIZE MATCH**. Abort only works while the match is ACTIVE and resets the room to LOBBY. |
| **Start / Finalize pressed twice, or the page reloaded mid-click** | Double click or a lost response. | Safe. Repeating the same action returns success; it never starts or finalizes twice. If the room is already in the target state the console treats it as done. |

---

## Event-Day Safety Checklist

- [ ] Latest `main` deployed and `npm run verify:prod` is green (docs/DEPLOY_CHECKLIST.md). No deploys or migrations on event day.
- [ ] Supabase dashboard: anonymous sign-ins on, per-IP hourly limit noted, backup taken that morning.
- [ ] One rehearsal match end to end on the event laptop and Wi-Fi: create room, 6 phones join, start, a rent, a purchase, an upgrade, a team in debt, let the clock run out, finalize, next match.
- [ ] Two admins logged in on separate laptops; both can open the room. Only one edits at a time (the second sees a conflict dialog, not a double edit).
- [ ] Phone hotspot ready as the Wi-Fi fallback; paper scoreboard template printed (section 5).
- [ ] Every captain knows: PIN is 4 digits, a wrong PIN five times locks that phone for a minute.
- [ ] Rules in hand: highest cash wins; ties go to owned business cost, then upgrades, then share the rank; a team still in debt at the end cannot win (docs/SCORING_RULES.md).

---

## 5. Emergency Paper Fallback Scoreboard Template

If a prolonged catastrophic power or network outage occurs, use this paper template:

```
=============================================================================================
                          STARTUPOLY OFFICIAL TOURNAMENT SCOREBOARD (PAPER)
Match ID: ______________   Date: ______________   Game Master: _____________________________
=============================================================================================
Slot | Team Name       | Start Cash | Cash Edits (+ / −) | Final Cash | Businesses | Debt
---------------------------------------------------------------------------------------------
 #1  |                 |   ₹1,000   |                    |            |            |
---------------------------------------------------------------------------------------------
 #2  |                 |   ₹1,000   |                    |            |            |
---------------------------------------------------------------------------------------------
 #3  |                 |   ₹1,000   |                    |            |            |
---------------------------------------------------------------------------------------------
 #4  |                 |   ₹1,000   |                    |            |            |
---------------------------------------------------------------------------------------------
 #5  |                 |   ₹1,000   |                    |            |            |
---------------------------------------------------------------------------------------------
 #6  |                 |   ₹1,000   |                    |            |            |
=============================================================================================
Ranking: 1) Highest Cash -> 2) Owned business cost -> 3) Upgrades -> 4) Shared rank
Final Verified Winner: ___________________________   Signature: _____________________________
```

---
*End of Runbook.*
