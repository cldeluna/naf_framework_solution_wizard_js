# NAF Design Solution Wizard — Quick Tutorial

The Design Solution Wizard helps you describe a network automation project using the [NAF Framework](https://reference.networkautomation.forum/Framework/Framework/). You fill in a "puzzle" of 10 pieces, then export or share the result as a solution design document.

**Site:** https://naf-solution-wizard.ing/

## Two usage modes

| | No account | Signed in with Google |
|---|---|---|
| Fill in, download, and reload the wizard | ✅ | ✅ |
| Browse the shared catalog / save & edit your own entries | ❌ | ✅ |

Sign-in is only for the shared catalog — everything else works with no account at all.

## 5-minute walkthrough

1. **Open the site.** You don't need an account to use the wizard — everything works signed out.
2. **(Optional) Sign in with Google** on the Home page if you want to save your design to the shared community catalog or load one later. Skip this if you just want a file to keep locally.
3. **Click "🚀 Start Building Your Solution"** to open the Wizard.
4. **Click any puzzle piece** to fill in that section:
   - The 4 **border pieces** are project context: Problem Statement & Use Case (WHY), Stakeholders & My Role (WHO), Staffing & Timeline (WHEN), Dependencies (WHAT).
   - The 6 **inner pieces** are the NAF components: Presentation, Intent, Observability, Orchestration, Collector, Executor.
   - A piece snaps into place and gets a ✅ once its required info is filled in. The counter shows progress (n/10).
5. **Toggle "Required Only" vs "All Fields"** (top of the Wizard page) to control how much detail each section form asks for.
6. **Your work autosaves** to your browser as you type — no Submit button, nothing is lost if you close a panel or refresh.
7. **When you're ready, choose how to share it:**
   - **JSON only** — a single file you can re-load into the wizard later.
   - **📦 Bundle** — JSON + a rendered Markdown report + a Gantt chart image, zipped together.
   - **🗄 Save to catalog** (signed in only) — publishes to the shared community catalog so others can browse it on the Solutions page.

## Good to know

- Nothing is lost mid-edit — closing a section panel keeps whatever you typed.
- **Plan to save to the catalog? Sign in early.** The "🗄 Save to catalog" button is grayed out (not clickable) until you're signed in — it won't prompt you to sign in itself. You can still fill in pieces while signed out; when you're ready to save, go sign in from the Home page, then come back to the Wizard. Your progress carries through the sign-in redirect either way.
- Reopening the site later offers to restore your last draft from this browser.
- **Load naf_report_*.json** (under "📂 Open") brings a previously exported file back into the wizard to keep editing.
- Loading someone else's shared design and saving it creates your own copy (a "fork") — it won't overwrite theirs.

For the full walkthrough of every section and field, see the project README.
