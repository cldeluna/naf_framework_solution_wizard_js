# NAF Design Solution Wizard — User Guide

Live site: **https://naf-solution-wizard.ing/**

The wizard works fully signed out — sign-in is only needed to save to or load from the shared community catalog.

## Usage modes

The app is designed around two distinct modes, and you can move between them at any time without losing work:

| | Standalone (no account) | Authenticated (signed in with Google) |
|---|---|---|
| **Fill out the wizard** | ✅ Full puzzle, all ten sections | ✅ Same |
| **Download your work** | ✅ JSON or the JSON+Markdown+Gantt ZIP bundle | ✅ Same |
| **Upload/reload your work** | ✅ Load a previously downloaded `naf_report_*.json` back into the wizard | ✅ Same |
| **Browse the Community Solutions catalog** (titles, ITIL category, and a short abstract preview for each published design) | ✅ Teaser cards visible — sign in to load a design or see full details | ✅ Full catalog with Load, fork, and delete controls |
| **Load a community design into the wizard / fork it as your own** | ❌ Sign in required | ✅ One click to load any published design; saving creates your own copy |
| **Save your design to the shared catalog, or edit/update one you already saved** | ❌ Not available | ✅ Required |

Everything you need to work through the wizard on your own — filling it in, downloading it, coming back and loading it again — is available with no account at all. Signing in only comes into play when you want to look at what others have submitted or publish your own entry in that shared catalog.

## Navigation and experience settings

Every page is framed by a **left sidebar** that stays visible as you work:

- **Nav links** — Home, Design Solution Wizard, Community Solutions, Admin, Terms. The active page is highlighted with a yellow underline.
- **Experience** toggle (Guided / Free Form) — controls how the Wizard is paced. See below.
- **Field View** toggle (Detailed / Compact) — global default for every section form; can be overridden per panel inside the form. See below.
- **Auth badge** — shows your sign-in state; sign in / sign out without navigating away.

**On mobile (narrow screens)** the sidebar collapses into a compact horizontal bar at the top of the screen. Nav links show as emoji icons only (the full label appears as a tooltip on tap/hover). The Experience, Field View, and auth controls are hidden on mobile — set them on a wider screen first; the choices persist in browser storage and apply on mobile automatically.

### Experience modes

| Mode | What it does |
|---|---|
| **Free Form** (default) | Open sandbox — start any section in any order. Best when you already know the NAF framework or prefer to fill things in as ideas come. |
| **Guided** | Concierge experience — sections are numbered 1–10 in the recommended order. Each puzzle piece and section button shows its step number. Each open form shows "Step N of 10" in the header and a **Next → Step N+1** button at the bottom, walking you through business and solution design in sequence. |

Guided order: Problem Statement → Stakeholders → Staffing & Timeline → Dependencies → Presentation → Intent → Orchestration → Observability → Collector → Executor.

Switching modes mid-session is safe — your data is never affected, only the step numbering and Next button appear or disappear.

### Field View

| View | What it shows |
|---|---|
| **Detailed** (default) | Every field — for a thorough, complete design document that captures full nuance. Richer output, better conversations with stakeholders. |
| **Compact** | Required fields only — faster to fill in and good for a first pass. Switch to Detailed any time to add depth. |

The sidebar toggle sets the global default. Each individual form panel also has its own Compact / Detailed toggle in the top-right corner for a one-off override without changing the global default.

## Home page

- Framework overview and a **🚀 Start Designing Your Solution** button that opens the Wizard.
- **Sign in with Google** here if you want catalog access. Signing in never clears a wizard you've already started — your draft is saved in the browser regardless of auth state.
- **If you plan to save to the catalog, sign in early.** The "🗄 Save to catalog" button on the Wizard page is grayed out and not clickable until you're signed in — it does not prompt you to sign in when clicked. You can still fill in puzzle pieces while signed out; just come back to the Home page and sign in with Google before (or any time before) you're ready to save. Signing in mid-wizard is safe either way: the sign-in redirect reloads the page, but your entries were already autosaved to the browser's local storage and are restored automatically on load.
- Expandable sections cover what the wizard collects and how saving/loading works.

## The Wizard page

**The puzzle.** Ten pieces: 4 border pieces (project context) around 6 inner pieces (the NAF framework components).

| Piece | Required fields (block saving to the catalog) | All fields |
|---|---|---|
| Problem Statement & Use Case (border, top) | Author, title, description, ITIL category, category, problem statement, use case, workflow description | + Workflow steps (structured name/description rows), error conditions, assumptions, deployment strategy + description, out of scope, risk of not moving forward (standard reasons + free text) |
| Stakeholders & My Role (border, left) | My Role: who you are, your technical skills, who will develop the solution | + Stakeholder categories affected (checkboxes by category), other stakeholders (free text) |
| Staffing & Timeline (border, right) | Development approach (build vs. buy), staffing plan | + Direct staff count, professional-services staff count, holiday calendar region, project start date, milestones (name/duration in business days/notes) — generates a projected completion date and Gantt chart |
| Dependencies (border, bottom) | Dependencies & external interfaces narrative | + External systems/interfaces checkboxes with per-item details |
| Presentation | *(none)* | Intended users, interaction modes (CLI/Web GUI/API/etc.), tools, authentication method — each with a Custom/Other option |
| Intent | *(none)* | Development approach, how intent is consumed/provided |
| Observability | *(none)* | How solution state is determined, go/no-go logic, optional additional gating logic, observability tools |
| Orchestration | *(none)* | Orchestration approach (or explicitly "no orchestration layer") + details |
| Collector | *(none)* | Collection methods, authentication, traffic handling, normalization, scale (devices, metrics/sec, cadence), collection tools |
| Executor | *(none)* | Execution methods |

The 6 inner NAF-component pieces have no save-blocking fields — anything you fill in there is optional, though the more detail the better for the generated report.

Click any piece (or the matching button below the puzzle) to open its form in a side panel. A piece turns ✅ once its required fields are filled in with meaningful content — this is calculated automatically, there's no separate "submit" step. Progress is shown as **n/10**.

Every form has a **Custom / Other** option with a free-text field for anything not covered by the preset checkboxes. If you can't answer a question technically, note that the function is needed and describe it in the Custom field.

**Field tooltips.** Every field has a **?** button next to its label. Click or tap it to see a contextual hint — what the field means in NAF terms, what a good answer looks like, and why it matters for the generated report. Key narrative fields (Problem Statement, Use Case, Abstract, Workflow) lead with a guiding question to help you frame your answer.

**Experience mode** (Guided or Free Form) and **Field View** (Detailed or Compact) are set in the left sidebar and apply across all section forms. Each form panel also has its own Compact / Detailed override in the top-right corner.

**Autosave.** Every keystroke writes to your browser's local storage — closing a panel, refreshing, or signing in mid-wizard never discards what you've entered. The toolbar badge shows when the draft was last autosaved, or that a prior draft was restored.

## Saving and sharing your work

Below the puzzle:

- **📂 Open → Load naf_report_*.json** — re-load a previously exported file to keep editing it.
- **💾 Download → 📦 Bundle (JSON + MD + Gantt)** — a ZIP containing the JSON payload, a rendered Markdown solution design report, and a Gantt chart image. Best for sharing with a team or stakeholders.
- **💾 Download → JSON only** — just the data file, useful for re-importing later or handing to someone else running the same app.
- **🗄 Shared Catalog → Save to catalog** (requires sign-in and all required fields complete) — publishes your initiative and solution to the shared Supabase-backed catalog. If you loaded a design you own, you'll be offered **Update** (overwrite it) or **Save as new**. Loading and saving *someone else's* design always creates your own fork — it never overwrites theirs.
- **⚠️ Danger Zone → Reset wizard** — clears everything after a confirmation prompt.

A live preview ("📄 Detailed solution description") shows the rendered report and Gantt chart as you build, once any section has content.

## Solutions page (shared catalog)

Signed-out visitors see **teaser cards** — title, ITIL category chips, and a short problem-statement preview. Signing in unlocks full details, the Load button, and save/delete controls.

The catalog is a **card grid** — one summary card per initiative, everything visible without expanding anything:

- Each card shows the **title**, **ITIL practice + category chips** (the card's top edge is color-coded by ITIL practice, matching the puzzle palette), a short **problem-statement snippet**, the submitter/date/solution-count line, and every **solution inline** with its deployment-strategy chip.
- **🔎 Search box** filters live across title, problem statement, use case, category, and author; an **ITIL category dropdown** beside it narrows the grid to one practice — it always lists all eight practices with a count of how many initiatives each holds.
- **📥 Load** on any solution row pulls that design into the Wizard in one click. Saving afterward forks it under your account unless it's yours and you choose Update.
- **🗑 Delete** — on solution rows you own (and, for admins, on anything); owners/admins also get a card-footer delete for the whole initiative + its solutions.
- Submitter contact (name/email) is shown only if the submitter opted in when saving; a **mine** tag marks your own records.

If no database is configured for a given deployment, this page falls back to a message pointing you at file-based Download/Load instead.

### Load and fork a community design (sign-in required)

This is one of the most valuable features of the shared catalog, and it is only available to signed-in users.

**What it does:** Clicking **📥 Load** on any solution row instantly fills the entire Wizard with that community member's design — all ten sections, exactly as they submitted it. The puzzle pieces fill in, the completion indicators update, and the live report preview renders, all in one click. You can then read through it, compare it to your own situation, and adapt it.

**Forking — your copy, not theirs:** When you save a loaded design, the app always creates a new entry under your own account. It never modifies the original. This is true even if you edit heavily and save to the catalog — the submitter's record is untouched. The only exception is if you load one of your *own* previously saved designs, in which case you are offered a choice: **Update** (overwrite your entry) or **Save as new** (create a second version).

**Why this matters:**
- Jump-start your own design by adapting a real-world example from the community rather than starting from a blank puzzle.
- Study how others have structured their Problem Statement, Use Case, and NAF component choices for similar automation projects.
- Use a community design as a template — load it, clear the sections that don't apply, fill in your own context, and save it as your own.

**Workflow:** Sign in on the Home page → go to Community Solutions → find a relevant design → click **📥 Load** → adapt it in the Wizard → download or save to the catalog.

## Admin page

Restricted to accounts with the `admin` role. Lets an admin grant/change roles (`viewer`/`editor`/`admin`) by user UID. Catalog moderation — deleting any solution or initiative regardless of owner — happens on the Solutions page, where admins see delete controls on every record.

## Terms & Definitions page

Reference glossary: use-case categories, deployment strategies, and the curated automation tool catalog, each with definitions/links.

## Troubleshooting

- **Lost your place after closing the browser?** Reopen the site — it offers to restore your last autosaved draft.
- **Filled in pieces while signed out, then signed in to save — did it keep your work?** Yes, that's expected. Sign-in redirects to Google and back, but the draft was already autosaved locally before the redirect and is restored automatically.
- **Can't save to the catalog?** The Save button stays grayed out until you're signed in — it won't prompt a sign-in for you, so go sign in via the Home page first. It also requires every *required* field to be filled in; hover the button to see how many are still missing.
- **Importing an old JSON file that came from the original Streamlit app?** It should still load — legacy fields are tolerated on import.
- **I loaded a community design and saved it — did I overwrite the original?** No. Saving someone else's loaded design always creates a new entry under your account. The original is never touched. Only loading and saving *your own* previously published design gives you the option to update it in place.
