# Startupoly

> 

STARTUPOLY — Event Rulebook & Organizer Handbook


## Event Overview

STARTUPOLY is a live startup simulation board game where teams compete to build the most valuable company portfolio within a limited time. Teams physically move around a startup-themed board, acquire businesses, upgrade them, generate Company Value (CV), pay and collect rent, receive bonuses, survive crises, and complete special actions.

The game combines strategy, entrepreneurship, risk/reward decisions, business portfolio building, quick decision-making, team interaction, and physical gameplay.

> 

The physical board is the main gameplay interface. The live digital scoreboard is used only to track game state. Each match has exactly **50 minutes of gameplay**.


## Event Structure


| Event item | Rule |
| Total event duration | **1.5 days** |
| Physical boards | **1** STARTUPOLY board |
| Total matches | 10 |
| Teams per match | 6 |
| Players per team | 4-5 |
| Match duration | **60 minutes total** |
| Setup | **5 minutes** |
| Gameplay | **50 minutes** |
| Wrap-up / reset | **5 minutes** |
The same physical board is reset and reused for every match. The 50-minute gameplay period is strict: when it ends, gameplay stops immediately. No additional final turn or roll is given.


## Objective

The objective is to build the highest-value company by the end of the 50-minute gameplay period.

Teams manage two resources:


| Used for / represents | Resource |
| Buying businesses, upgrading businesses, paying rent, paying penalties, and handling other cash-based events | **Cash** |
| The value of the team’s startup portfolio | **Company Value (CV)** |
Teams gain CV through buying businesses, upgrading businesses, landing on businesses they own, bonus cards, and other specified game actions.

> 

**Total Company Value = Cash + Company Value.** The active team with the highest Total Company Value at the end of gameplay wins.


## Starting State

Every team starts with:

- **₹1,000 Cash**
- **0 Company Value**
- **0 Businesses**
- **0 Upgrades**
- One team token
Team order is determined before gameplay begins. Turns follow strict round-robin order: Team 1 → Team 2 → Team 3 → Team 4 → Team 5 → Team 1, and so on.


## Physical Board

The physical board contains exactly **24 spaces**. Multiple teams may occupy the same space; team tokens do not block movement.


| Number of spaces | Space type |
| **1** | START |
| **3** | Action |
| **10** | Business |
| **4** | Bonus Card |
| **4** | Crisis Card |
| **2** | Wildcard |
| **24** | **Total** |

## Board Architecture

The four corners are:

1. START
1. Action B
1. Action C
1. Action D
There are **5 normal spaces between each pair of corners**:

START → 5 spaces → Action B → 5 spaces → Action C → 5 spaces → Action D → 5 spaces → START

The board is the physical source of truth for movement, landing spaces, tokens, ownership markers, cards, and player interaction.


### START

When a team reaches or passes START, it receives:

- **+₹200 Cash**
- A Growth Bonus based on the number of Businesses owned:

| Growth Bonus | Businesses owned |
| No additional CV | 0 |
| **+200 CV** | 1 |
| **+500 CV** | 2 |
The Growth Bonus is applied every time the team reaches or passes START. Landing exactly on START counts as reaching START. If a team crosses START multiple times because of additional rolls, the reward applies each time.


## Business System

There are exactly **10 Business spaces**. Use each company name as the primary board label and its category as a smaller subtitle. Company names are used for educational/event simulation purposes and do not represent sponsorship, endorsement, or affiliation.


| Business | Initial CV | Cost | Category |
| OpenAI | +250 | ₹500 | AI / DeepTech |
| Zoho | +180 | ₹300 | SaaS |
| Flipkart | +180 | ₹300 | E-Commerce |
| PhonePe | +200 | ₹400 | FinTech |
| Qure.ai | +200 | ₹400 | HealthTech |
| Physics Wallah | +150 | ₹200 | EdTech |
| Postman | +190 | ₹300 | Developer Tools |
| Cloudflare | +220 | ₹400 | Cybersecurity |
| Ola Electric | +240 | ₹500 | CleanTech / Energy |
| Addverb | +250 | ₹500 | Robotics & Automation |
A team can own a maximum of 2** Businesses**.


## Buying Businesses

When a team lands on an unowned Business space, it may purchase the Business:

1. Pay the listed Cost to the Bank.
1. Mark the Business as owned by the team.
1. Add the Business’s Initial CV to the team’s Company Value.
If the team declines, the Business remains unowned and no payment or CV is awarded. A team that already owns **3 Businesses** cannot purchase another Business. There is **no bidding system**.


## Rent

If a team lands on another team’s Business, the visiting team pays rent to the owner. Rent is calculated from the Business’s original purchase Cost:


| Rent | Business level |
| **50% of original Cost** | Base |
| **75% of original Cost** | Upgrade 1 |
| **100% of original Cost** | Upgrade 2 |
The owner receives the rent payment and gains the corresponding landing CV according to the Business’s current upgrade level.


## Upgrades

Each Business can have a maximum of **2 upgrades**. Upgrades increase CV and the rent generated when another team lands on the Business.


| CV Added | Rent | Upgrade Cost | Level |
| Base CV | 50% of Cost | ₹0 | Base |
| +300 CV | 75% of Cost | **FINAL VALUE TO BE CONFIRMED** | Upgrade 1 |
| +400 CV | 100% of Cost | **FINAL VALUE TO BE CONFIRMED** | Upgrade 2 |
A team can upgrade only a Business it owns and only while it is below Upgrade 2. The team must pay the applicable upgrade cost to the Bank. No upgrade cost is invented or assumed in this document.


## Selling / Bankruptcy

Businesses cannot be voluntarily sold. Selling occurs only when a team cannot pay a required payment.

When a team cannot pay:

1. Use available Cash first.
1. If Cash is insufficient, the team chooses Businesses to sell.
1. Each sold Business returns to the Bank.
1. The team receives that Business’s original purchase Cost.
1. Upgrade costs are not refunded.
1. Upgrade value is not added to the sale price.
1. Previously earned CV is not removed.
1. The Business returns to Base level when available again.
If the team has no Businesses left and still cannot pay the required amount, the team is eliminated. Eliminated teams are not eligible to win.


## Dice & Turns

On a normal turn:

1. Roll the die.
1. Move the team token by exactly that number.
1. Resolve the landing space immediately.
1. If the roll was 6, roll again.
1. Resolve the new landing before rolling again.
1. Continue until no additional roll is granted.
1. Pass the turn to the next team.

### Three Sixes Rule

If a team rolls three consecutive 6s during the same turn:

- The entire turn is cancelled.
- The team returns to its position before the turn began.
- All effects from that cancelled turn are reversed.
Reversal includes movement, Cash changes, CV changes, Business purchases, upgrades, rent payments or collections, card rewards or penalties, and action effects. The turn then passes to the next team.


## Action Spaces

There are exactly **3 Action spaces**.


### Action B — Pitch to Investors

The team must give a short pitch explaining why one owned Business is valuable, useful, promising, or worth investing in. If the team owns at least 1 Business, the pitch is mandatory. If the team refuses or fails to perform it, the team loses its next turn. If the team owns 0 Businesses, skip the action with no penalty.


### Action C — Lose the Feature

The team immediately loses **200 CV**. Company Value cannot fall below 0.


### Action D — Steal Talent

Choose any other team and take **₹100 Cash** from it. If that team has less than ₹100, take whatever Cash it currently has. If it has ₹0, the action still succeeds and ₹0 is transferred. No Business is transferred, and no Business sale is triggered by this action.


## Bonus Cards

There are exactly **4 Bonus Card spaces** and **6 possible Bonus Cards**. The movement roll determines which Bonus Card is drawn.


| Bonus Card | Effect |
| Startup Grant | +₹300 Cash |
| Viral Growth | +300 CV |
| Government Incentive | +₹200 Cash and +200 CV |
| Premium Deal | Cash equal to the purchase Cost of the most expensive Business currently owned; ₹0 if none |
| Founder Bonus | +₹100 Cash for every Business owned |
| Lucky Break | Roll the die again and receive **₹100 × the number rolled** |
Lucky Break’s second roll is reward-only: it does not cause movement, trigger another board space, or create another Lucky Break.


## Crisis Cards

There are exactly **4 Crisis Card spaces** and **6 possible Crisis Cards**. The movement roll determines which Crisis Card is drawn.


| Effect | Crisis Card |
| −₹300 Cash | Tax Raid |
| −300 CV | Market Crash |
| −₹200 Cash and −200 CV | Legal Trouble |
| −₹100 Cash for every Business owned; ₹0 if none | Burn Rate Spike |
| −₹100 Cash and −200 CV | Bad PR |
| −₹500 Cash | Investor Pullout |
Company Value cannot fall below 0. Crisis Cards do not automatically force a Business sale. If a resulting payment cannot be made, the normal forced-sale rules apply.


## Wildcards

There are exactly **2 Wildcard spaces**. When a team lands on one:

1. Draw one Wildcard Chit.
1. One team member performs the task.
1. The task is mandatory.
1. Complete it before continuing.
Wildcard tasks must be quick, funny or engaging, self-contained, and independent of the team’s Businesses. They must not provide Cash, CV, or a strategic advantage. Their purpose is to add unpredictable, social, physical, or entertaining moments.


## Gameplay Flow


### Before the Match

- [ ] Prepare the physical board.
- [ ] Prepare team tokens.
- [ ] Prepare Business ownership markers.
- [ ] Prepare upgrade markers.
- [ ] Prepare Bonus Cards, Crisis Cards, and Wildcard Chits.
- [ ] Prepare the Bank station and Card station.
- [ ] Set up the live digital scoreboard.
- [ ] Assign teams and team numbers.
- [ ] Give each team ₹1,000 starting Cash.
- [ ] Explain the rules briefly.
- [ ] Determine turn order.

### During the Match

1. Start the 50-minute timer.
1. Team 1 begins.
1. Teams play in strict round-robin order.
1. Teams roll, move, and resolve spaces immediately.
1. The Bank handles Cash and Business transactions.
1. The Cards Distributor handles Bonus, Crisis, and Wildcard items.
1. Tech Runners update and maintain the digital scoreboard.
1. Support / Floaters assist with disputes, movement, reset, and crowd flow.
1. The Game Master controls timing and final rulings.

### End of Match

When 50 minutes end:

1. Stop gameplay immediately.
1. Allow no additional roll.
1. Freeze the current game state.
1. Calculate or confirm each active team’s Total Company Value.
1. Apply tie-breakers if needed.
1. Record the winner.
1. Conduct the 5-minute wrap-up and reset.

## Winner Determination

At the end of gameplay:

**Total Company Value = Cash + Company Value**

The active team with the highest Total Company Value wins. If tied:

1. Higher Cash wins.
1. If Cash is tied, more Businesses owned wins.
1. If still tied, each tied team gives a 30-second pitch to the judges; the judges determine the final winner.
Eliminated or bankrupt teams are not eligible to win.


## Live Digital Scoreboard

The website is the digital bookkeeping layer, not a replacement for the physical board.


| Physical board | Digital scoreboard |
| Movement and landing spaces | Score tracking |
| Team tokens | Game state |
| Business ownership markers | Live standings |
| Physical cards and chits | Team name, Cash, CV, Businesses, upgrade levels, and Total Company Value |
| Player interaction | — |
Tech Runners maintain the technical side of the scoreboard.


## Organizing Team

There are exactly **8 organizers** assigned to the board.


| Responsibilities | Role | Count |
| Controls the match, starts/stops the timer, explains rules, handles disputes, makes final rulings, and keeps gameplay moving | Game Master | 1 |
| Handles Cash, Business purchases, upgrades, rent, and forced sales | Bank | 1 |
| Distributes Bonus Cards, Crisis Cards, and Wildcard Chits and keeps the system organized | Cards Distributor | 1 |
| Maintain the live scoreboard, update team states, handle technical issues, and support display/mobile access | Tech Runners | 2 |
| Help teams, assist with movement and markers, handle minor disputes, support resets, manage crowd flow, and fill in as needed | Support / Floaters | 3 |
| — | **Total** | **8** |

## Setup Requirements


### Physical Setup

- [ ] Large STARTUPOLY board/banner
- [ ] Large team tokens
- [ ] Die and backup die
- [ ] Business ownership markers
- [ ] Upgrade markers
- [ ] Bank station
- [ ] Card station
- [ ] Player standing area
- [ ] Organizer/support area

### Digital Setup

- [ ] Live scoreboard website
- [ ] Devices for Tech Runners
- [ ] Player-accessible scoreboard
- [ ] Stable local/network connection where required
The physical board is reused for every match.


## Materials Required


### Board & Gameplay

- Physical STARTUPOLY board/banner
- Large team tokens
- 1 die
- 1 backup die
- Business ownership markers
- Upgrade markers

### Cards

- Bonus Cards
- Crisis Cards
- Wildcard Chits

### Stations

- Bank station
- Card station
- Tables and chairs as required

### Digital

- Live scoreboard system
- Devices for Tech Runners
- Required display or mobile devices

## Match Reset

Complete the following during the 5-minute reset:

- [ ] Remove all team tokens.
- [ ] Reset all Business ownership.
- [ ] Remove all upgrade markers.
- [ ] Return all Businesses to the Bank.
- [ ] Collect all Bonus Cards.
- [ ] Collect all Crisis Cards.
- [ ] Collect all Wildcard Chits.
- [ ] Reset the scoreboard.
- [ ] Prepare ₹1,000 starting Cash for every new team.
- [ ] Confirm the new team order.
- [ ] Confirm the board is ready.
The physical board remains in place throughout the event.


## Quick Rules / No Confusion

> 

- Exactly **24 board spaces**: 1 START, 3 Actions, 10 Businesses, 4 Bonus spaces, 4 Crisis spaces, and 2 Wildcards.
- There are exactly **10 Businesses**.
- Maximum 2** Businesses per team**.
- **No bidding**.
- **No voluntary Business selling**; forced selling happens only when a required payment cannot be made.
- Maximum **2 upgrades per Business**.
- Rolling **6** gives another roll. Resolve every roll before rolling again.
- **Three consecutive 6s cancel the entire turn** and reverse its effects.
- Exact START landing counts as reaching START.
- Multiple teams can occupy the same space.
- Lucky Break’s second roll is reward-only and does not cause movement.
- Crisis penalties do not automatically force Business sales.
- Company Value cannot go below **0**.
- Gameplay ends exactly at **50 minutes**. There is no extra final turn.
- Winner calculation is **Total Company Value = Cash + Company Value**.

## Quick Reference


| Value | Rule |
| ₹1,000 | Starting Cash |
| 0 | Starting CV |
| 2 | Maximum Businesses |
| 2 | Maximum Upgrades / Business |
| +₹200 | START Cash Reward |
| +200 CV | START: 2 Businesses |
| +500 CV | START: 3 Businesses |
| 50% of Cost | Base Rent |
| 75% of Cost | Upgrade 1 Rent |
| 100% of Cost | Upgrade 2 Rent |
| FINAL VALUE TO BE CONFIRMED | Upgrade 1 Cost |
| FINAL VALUE TO BE CONFIRMED | Upgrade 2 Cost |
| Extra Roll | Roll 6 |
| Turn Cancelled | Three 6s |
| 50 minutes | Gameplay |
| 24 | Board Spaces |
| 10 | Businesses |
| 4 | Bonus Spaces |
| 4 | Crisis Spaces |
| 2 | Wildcards |
| 3 | Action Spaces |
| 6 | Teams / Match |
| 4-5 | Players / Team |
| 10 | Total Matches |
| 8 | Organizers |
