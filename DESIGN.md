# Bookie Design System

> Product interface specification for Bookie. This is the source of truth for all frontend UI. Follow it for new screens and when modifying existing components. Do not copy another product's brand identity; use the references below for proven interaction and layout patterns, translated into Bookie's own system.

## 1. Visual Theme & Atmosphere

Bookie is a **focused learning workspace**. It should feel like a capable desktop application for reading, understanding, remembering and asking—not a marketing site, document/PDF viewer, generic admin dashboard, or collection of decorative cards.

**Product principles**
- Source-first: the user's document is the main object. Keep it visible and make every downstream action trace back to it.
- Task-forward: every screen has one primary task and a small number of contextually relevant secondary actions.
- Calm, confident, precise: no oversized promotional headlines inside the application, no gradients as decoration, no excessive rounded cards, no ornamental status labels.
- Interactive, not editorial: use clear controls, tabs, toolbars, panels, progress feedback, keyboard support, and responsive states. Avoid dense all-caps eyebrows and tiny print.
- Evidence over claims: show real source passages, real analysis outputs, and honest empty states. Never invent progress, scores, activity, sync, or AI capability.
- One product language: Overview, Understand, Study, Ask Bookie and Library share navigation, typography, controls, spacing, and feedback patterns.

**Reference interpretation**
- Notion: source-centric workspace structure, restrained rectangular controls, clear content hierarchy, flexible documents.
- Linear: compact application chrome, information density, precise borders, clear focus and keyboard interactions.
- Intercom: conversation clarity, readable message hierarchy, contextual evidence and response states.
These are pattern references only; do not reuse their logos, proprietary assets, or exact brand signature.

## 2. Color Palette & Roles

Use semantic tokens. Never introduce ad hoc hex colours in component markup.

| Token | Value | Role |
|---|---|---|
| `canvas` | `#F7F8FA` | Main app background |
| `surface` | `#FFFFFF` | Main working panels and cards |
| `surface-muted` | `#F1F3F7` | Secondary panels, input backgrounds |
| `surface-raised` | `#FFFFFF` | Menus and overlays with subtle elevation |
| `ink` | `#202536` | Primary text and headings |
| `ink-secondary` | `#566176` | Body copy and navigation |
| `ink-muted` | `#778196` | Supporting text; minimum 12px for important content |
| `ink-disabled` | `#A2AABC` | Disabled and placeholder text only |
| `line` | `#E1E5EC` | Standard borders and dividers |
| `line-strong` | `#C7CFDB` | Input borders and high-contrast separators |
| `brand` | `#4F5FD5` | Primary action, selected nav, links, focus |
| `brand-hover` | `#414FB9` | Hover and pressed state |
| `brand-soft` | `#EEF0FF` | Selected and highlighted backgrounds |
| `brand-ink` | `#34429F` | Text on brand-soft backgrounds |
| `info` | `#287FA7` | Informational state only |
| `success` | `#237A58` | Successful completion only |
| `success-soft` | `#EAF5EF` | Success feedback background |
| `warning` | `#98651F` | Warnings only |
| `warning-soft` | `#FFF5E5` | Warning backgrounds |
| `danger` | `#B23D56` | Destructive/error state only |
| `danger-soft` | `#FFF0F2` | Error backgrounds |

Rules:
- Brand indigo is the only persistent chromatic UI accent. Blue/cyan, coral, green and amber are semantic—not decorative category colours.
- Never use green for generic status, privacy, navigation, ordinary labels or decorative icons.
- Never place muted text on a tinted background unless contrast remains readable. Body text must meet WCAG AA contrast (4.5:1); large text 3:1.
- Avoid gradient fills. Brand buttons are solid.
- Background and surface contrast must be subtle but detectable. Separate panels with borders before adding shadows.

## 3. Typography Rules

**Font:** Manrope (already loaded by the app) for UI and body. Use system sans fallback. Do not use serif type for interface text. Reserve monospace for technical metadata only.

| Role | Size | Weight | Line height | Use |
|---|---:|---:|---:|---|
| App page title | 28–32px | 700 | 1.2 | One per view |
| Section title | 20–22px | 700 | 1.3 | Major section |
| Panel title | 15–16px | 650 | 1.35 | Panels and dialogs |
| Body | 14px | 400 | 1.55 | Default content |
| Body compact | 13px | 400 | 1.55 | Dense lists and evidence |
| Control label | 13px | 600 | 1.4 | Buttons and fields |
| Metadata | 12px | 500 | 1.4 | Counts, timestamps, helper text |
| Technical | 11px | 500 | 1.4 | IDs, keyboard hints; never essential instructions |

Rules:
- No essential text below 12px. Avoid micro-uppercase copy except compact section metadata, never as the main content hierarchy.
- Body copy uses normal weight. Use bold sparingly for labels and key values.
- Sentence case everywhere. Do not use long uppercase eyebrow labels.
- Headings use modest negative tracking (-0.02em); body tracking is normal.
- Long passages use 60–80 characters per line where practical; line height 1.55–1.75.

## 4. Component Stylings

### Navigation
- Desktop left rail: 224–240px, white surface, 1px line border; logo area 56px high.
- Navigation rows: 40px high, 8px radius, 13px label, 8px icon-label gap.
- Active item: brand-soft background, brand-ink text, 2px left indicator or compact dot. Do not fill entire row with a saturated gradient.
- Group names: 11px medium muted sentence case, not tiny all-caps.
- Collapsed rail: icon-only with title tooltips and accessible names.
- Mobile: off-canvas drawer with a scrim, Escape to close, focus remains usable.

### Buttons
- Primary: brand fill, white text, 40–44px high, 8px radius, 14px semibold. One primary per panel.
- Secondary: white surface, strong line border, ink-secondary text.
- Tertiary: transparent, brand text, no border.
- Destructive: danger text and subtle danger-soft hover; confirm irreversible actions.
- Icon button: minimum 36×36px; accessible name and visible focus ring.
- Disabled: visibly disabled and non-interactive. Loading: spinner plus explicit action text; do not change the button width abruptly.

### Panels & Cards
- Main panels: white, 1px line border, 10–12px radius, 16–20px padding.
- Nested panels: surface-muted background, no additional shadow, 8px radius.
- Avoid card grids for everything. Use lists, split panes, tables and inline controls when they fit the content.
- Shadows: reserved for menus, dialogs, and sticky overlays (0 8px 28px rgba(20,30,55,.10)); no shadows on every card.

### Inputs
- 40–44px minimum height; 14px text.
- White surface, 1px line-strong border, 8px radius.
- Focus: 2px brand border and 3px translucent brand ring.
- Every input has a visible label or programmatic accessible name; placeholder is not a label.
- Error message is adjacent, specific, and announced with role=alert.

### Tabs and segmented controls
- Use 12–14px text, 36–40px height.
- Active tab has a clear brand underline or brand-soft fill; inactive tabs remain legible.
- Keyboard arrow navigation and correct tab semantics when appropriate.

### Document workspace
- The source editor/reader is the dominant pane.
- Toolbar includes filename, import state, word count and save state; keep actions adjacent to the document.
- Document canvas is white with readable 14–16px content and 1.65 line height.
- Analysis appears as a tabbed companion panel or below the editor, not as a separate marketing card stack.
- Preserve text during navigation and make unsaved edits explicit.

### Study
- Treat flashcards as interactive cards with front/back and announced flipped state.
- Quiz choices use fieldset/legend semantics or equivalent labelled groups; show correctness and explanation in text, not colour alone.
- Show answered count, current question and score with real derived values only.
- Give study generation/loading/error states clear feedback.

### Tutor
- Conversation is the primary content, not one large generic card.
- Differentiate user and assistant messages with alignment and subtle surfaces, not colour alone.
- Evidence is a nested citation block with source sentence identifiers and readable passages.
- New messages are announced through an accessible log. Composer stays visible and labelled.
- No AI answer is presented as grounded unless supporting source evidence exists.

### Library
- Search and filter controls above content.
- Use dense file rows or compact cards with file name, type, date and word count.
- Delete requires confirmation or an undo action.
- Empty state explains the next useful action.

### Feedback
- Loading: skeleton for layout content; inline spinner for short actions.
- Success: concise toast or inline confirmation. Semantic success green only here.
- Warning: amber only for meaningful warnings.
- Error: inline message next to affected control; preserve user input.
- Empty: explain why it's empty and provide one next action.

## 5. Layout Principles

- 4px base spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- App shell: fixed rail + flexible main panel; content max-width 1440px.
- Main view padding: 24–32px desktop, 16px mobile.
- Header: 60–64px, sticky; controls vertically centered.
- Use 12-column or CSS grid layouts only when it improves content relationships.
- Understand: document pane  minmax(0, 1fr), contextual tools 280–320px; collapse to a vertical flow under 900px.
- Dashboard: source/recent work is the main column; workflow and context should be visible without a giant marketing hero.
- Tutor: message area uses available height; composer anchored after message list.
- Study: generate controls first, then study modes, then results; avoid exposing all sections as one long undifferentiated wall.
- Avoid excessive blank space above the fold. Use information density appropriate to a working app.

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Base | Canvas, no shadow | Overall app |
| Surface | White + 1px line | Main editor, panels |
| Inset | Muted background, no shadow | Inputs, nested evidence, helper blocks |
| Overlay | White + subtle shadow | Dropdowns, dialogs, command menu |
| Focus | 3px brand ring | Keyboard and focused input |

- Never use multiple shadows on adjacent cards.
- Borders define layout; shadow only defines overlay stacking.
- Keep radius consistent (8px controls, 10–12px panels).

## 7. Do's and Don'ts

**Do**
- Use the same semantic tokens for every page and all states.
- Keep source content visually central.
- Show real interactions, labels, feedback and keyboard states.
- Prefer compact, meaningful navigation over decorative hero content.
- Give every screen one primary action.
- Test at 1440px, 1024px, 768px and 390px widths.
- Make keyboard focus visible and support reduced motion.
- Use correct semantic HTML and accessible names.

**Don't**
- Don't create marketing-landing-page heroes inside the signed-in app.
- Don't use serif UI type, ultra-small labels, huge gradients, glassmorphism or excessive roundness.
- Don't use green text except for actual successful outcomes.
- Don't present fake account, sync, activity, progress, AI mode or metrics.
- Don't use placeholder text as the only label.
- Don't use a clickable div when a button or link is appropriate.
- Don't destroy user content on failed saves or requests.
- Don't hide the main task beneath decorative content.

## 8. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Wide >=1440px | Rail + full split panes; content max 1440px |
| Desktop 1024–1439px | Rail + flexible work area; contextual pane may narrow |
| Tablet 768–1023px | Compact rail; side panes become collapsible or move below |
| Mobile <768px | Drawer navigation; one column; 44px touch targets; full-width primary action |

- No horizontal overflow at 390px.
- Search can collapse to an explicit search action, not an unlabeled icon.
- Tables may horizontally scroll within their own container.
- Document editor keeps readable 14px minimum font size; resize vertically.
- Buttons do not shrink below touch targets.
- Respect `prefers-reduced-motion`.
- Mobile drawer closes via Escape and after selecting a destination.

## 9. Agent Prompt Guide

When implementing a Bookie screen:
1. Read this file before editing UI.
2. Identify the screen's primary user task and preserve existing working API flows.
3. Use only the semantic colour, type, spacing, radius and depth tokens defined here.
4. Build all states: initial, populated, loading, error, success, disabled and empty.
5. Use semantic HTML, accessible names, keyboard operation and focus-visible treatment.
6. Keep the document or conversation as the primary content; avoid marketing-style hero layouts.
7. Test narrow and wide layouts. Do not claim visual verification unless the page was actually rendered and inspected.
8. Run the frontend typecheck and production build; run backend tests when backend files changed.
9. Any deliberate exception must be documented in the relevant component and in this design system.
