# Collaboration UI Spec (Screenshots + Live Prototype)

Source references used:
- Screenshots folder: docs/jobty_assets/collab_screenshot
- Live prototype: https://jobty.vercel.app/collaboration/1

## Visual Direction

- Theme: light enterprise workspace
- Canvas: very light gray app background with white cards
- Primary accents: turquoise/cyan for active states and CTA
- Secondary accent: indigo/violet for brand and tag outlines
- Typography: compact SaaS style, medium-high contrast headings
- Radius system: large rounded cards, pill buttons, circular step icons
- Shadows: very subtle, low elevation, soft edges

## Page Structure

1. Header bar
- Left: Jobty logo
- Center: "Espace Collaboration" label + small icon
- Right: outlined "Retour" pill button

2. Process stepper (10 steps)
- Steps:
  1) Prise de contact
  2) Décision
  3) Match confirmé
  4) Brief
  5) Contrat
  6) Paiement
  7) Collaboration
  8) Livraison
  9) Paiement libéré
  10) Clôture
- Visual states:
  - done: cyan filled circle + white icon
  - current: highlighted with ring
  - upcoming: gray circle + muted label
- Connectors should visually indicate completed path

3. Two-column body
- Left sidebar: freelancer identity card (+ optional project summary card after brief)
- Right workspace: stage-specific card body

## Sidebar Details

- Circular avatar with verified badge
- Name, role, location row with icon
- Stats triplet:
  - rating + stars + review count
  - projects count
  - response rate
- Skill chips (outlined rounded pills)
- Security badge strip: "Collaboration sécurisée par Jobty"
- Secondary summary card visible from brief stage onward:
  - objectif
  - budget (green emphasis)
  - délai

## Stage Content Requirements

### Stage 0 - Prise de contact
- Title block with icon and subtitle text
- Blue informational alert: limited messaging rule
- Chat card:
  - initial professional message bubble
  - avatar + timestamp
  - input toolbar: attachment, image, textarea, emoji, mic, send
- Primary CTA: "Proposer une collaboration"

### Stage 1 - Décision (En attente de réponse)
- Waiting state centered around professional avatar
- Three decision option cards shown as visual cues:
  - accepter
  - plus d'infos
  - refuser
- If current actor is pro, show action buttons to trigger choice
- If customer, show contextual instruction text depending on decision state

### Stage 2 - Match confirmé
- Success headline: "On bosse ensemble !"
- Match panel with both actors and handshake icon
- Trust/value checklist cards:
  - Espace privé sécurisé
  - Historique horodaté
  - Paiement sécurisé
  - Support Jobty 24/7
- CTA to start brief: "Rédiger le brief du projet"

### Stage 3 - Brief express
- Progress indicator showing completion percentage
- Form sections:
  - objectif (textarea)
  - livrables (clickable suggestion grid)
  - délai (select)
  - budget + FCFA suffix
  - optional file dropzone
- Professional comment box
- Actions: back + validate brief

### Stage 4 - Contrat digital simplifié
- Contract card generated with Jobty branding
- Parties section (project owner vs provider)
- Sections for:
  - object
  - deliverables
  - delay and amount
  - Jobty conditions
- Signature boxes per actor with signed state
- Demo helper action for dual-sign simulation if needed

## Components To Keep/Reinforce

- Keep stage-specific icons and icon color semantics
- Keep low-noise shadows and high whitespace
- Keep chips/pills and rounded cards consistent
- Keep feedback banners and status text concise

## Implementation Notes For This Codebase

- Primary implementation file: src/features/collaboration/pages/index.tsx
- Main stylesheet: src/features/collaboration/styles/collaboration/style.css
- Existing implementation already covers these stage blocks and should be refined incrementally, not rewritten from scratch.
- Avoid introducing a new visual system; keep continuity with current cyan/indigo tokens and spacing.

## Suggested Refinement Order

1. Normalize spacing and typography scale across all stages
2. Harmonize stepper state styles with screenshot values
3. Align sidebar card and stats spacing with screenshot rhythm
4. Polish form controls in brief stage (input heights, border colors, placeholders)
5. Tune contract card density and signature states
6. Validate responsive layout at mobile/tablet breakpoints
