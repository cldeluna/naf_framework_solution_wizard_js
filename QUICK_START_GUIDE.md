# NAF Design Solution Wizard — Quick Start Guide

The Design Solution Wizard helps you describe a network automation project using the [NAF Framework](https://reference.networkautomation.forum/Framework/Framework/). You fill in a "puzzle" of 10 pieces, then export or share the result as a solution design document.

**Site:** https://naf-solution-wizard.ing/

## Sign-in and the shared catalog

| | No account | Signed in with Google |
|---|---|---|
| Fill in, download, and reload the wizard | ✅ | ✅ |
| Browse the shared catalog (teaser cards) | ✅ | ✅ |
| Load a community design into the wizard / see full details | ❌ | ✅ |
| Save & edit your own catalog entries | ❌ | ✅ |

Sign-in is only needed for full catalog access — everything else works without an account.

## 5-minute walkthrough

1. **Open the site.** No account needed to use the wizard.
2. **(Optional) Sign in with Google** on the Home page if you want to save your design to the shared community catalog or load a community design into the wizard. Skip this if you just want a file to keep locally.
3. **Click "🚀 Start Designing Your Solution"** to open the Wizard.
4. **Choose your experience** in the left sidebar before you start:
   - **Free Form** (default) — start any section in any order, fill things in as ideas come.
   - **Guided** — numbered steps 1–10 with a **Next →** button on each form, walking you through in the recommended order: Problem Statement → Stakeholders → Staffing & Timeline → Dependencies → Presentation → Intent → Orchestration → Observability → Collector → Executor.
5. **Click any puzzle piece** (or the matching button below the puzzle) to fill in that section:
   - The 4 **border pieces** are project context: Problem Statement & Use Case (WHY), Stakeholders & My Role (WHO), Staffing & Timeline (WHEN), Dependencies (WHAT).
   - The 6 **inner pieces** are the NAF components: Presentation, Intent, Orchestration, Observability, Collector, Executor.
   - A piece gets a ✅ once its required fields are filled in. The counter shows progress (n/10).
6. **Use the ? tooltips** on any field for contextual hints — what the field means, what a good answer looks like, and why it matters for the generated report.
7. **Control how much detail each form shows** using the **Field View** toggle in the left sidebar:
   - **Detailed** — every field, for a thorough and complete design document.
   - **Compact** — required fields only, good for a fast first pass.
   Each form panel also has its own Compact / Detailed toggle in the top-right corner.
8. **Your work autosaves** to your browser as you type — no Submit button, nothing is lost if you close a panel or refresh.
9. **When you're ready, choose how to share it:**
   - **JSON only** — a single file you can reload into the wizard later.
   - **📦 Bundle** — JSON + a rendered Markdown report + a Gantt chart image, zipped together.
   - **🗄 Save to catalog** (signed in only) — publishes to the shared community catalog so others can browse it on the Solutions page.

## Good to know

- Nothing is lost mid-edit — closing a section panel keeps whatever you typed.
- **Plan to save to the catalog? Sign in early.** The "🗄 Save to catalog" button is grayed out until you're signed in — it won't prompt you to sign in itself. Fill in pieces while signed out, then sign in from the Home page when you're ready to save. Your progress carries through the sign-in redirect.
- Reopening the site later offers to restore your last draft from this browser.
- **Load naf_report_*.json** (under "📂 Open") brings a previously exported file back into the wizard to keep editing.
- Loading someone else's shared design and saving it creates your own copy (a "fork") — it never overwrites theirs.
- The left sidebar is always visible on desktop. On **mobile**, it collapses to a compact top bar showing emoji icons only — tap any icon to navigate. Set your Experience and Field View preferences on a wider screen first; they persist in browser storage.

For the full reference — every page, every field, and troubleshooting — see the [User Guide](./USER_GUIDE.md).
