# Claude in the Developer Workflow
## Outline — Blog Post + Workshop

**Audience:** Individual developers and engineering teams / leads  
**Goal:** Help developers move from "AI autocomplete" to "AI collaborator" — covering mindset, practical workflows, and Claude-specific capabilities  
**Formats:** Long-form blog post + hands-on workshop

---

## Section 0 — Hook / Framing

**Core thesis:** You're pair programming with Claude. Claude shows up as two engineers in one — a *senior* with vast breadth (every framework, pattern, and idiom in its training) and a *junior* with zero situational awareness (no idea what your code does, what your team values, or what you shipped last week). Which one shows up on any given task is decided by how well you've curated context. Your job is to be the **guide** — and the **judge** of what's good enough to ship.

This reframes the mixed experience most developers have already had. The wins happened when breadth was enough. The frustrations happened when specificity was required and absent. The unlock isn't a better prompt; it's recognizing that you're responsible for closing the gap.

**The growth arc.** A new hire who's technically excellent is useless on day one and indispensable by week six. The same arc applies to Claude on your codebase — not because the model itself grows, but because its *usefulness to you* grows as you accumulate context artifacts (CLAUDE.md, knowledge files, lessons logs, conventions). A new hire grows by accumulating context in their head. Claude grows by accumulating context in files you both can read. Same mechanism, different storage. You're not configuring a tool; you're onboarding a teammate who happens to externalize their memory.

**The metaphor's limit.** This is pair programming in the sense that matters — two minds on one problem, one of you accountable — and not in the literal sense. Claude doesn't tire, doesn't take the keyboard for an hour, and doesn't remember yesterday unless you make it. Naming that up front keeps the framing honest.

> **The whole idea in one paragraph:**
>
> *"Whether you're a developer running Claude Code in your terminal, or someone who uses Claude for writing, research, or business — the principle is the same: build a system around the AI. Give it memory. Give it rules. Challenge it. Let it learn. And keep it simple."*
>
> — [mindwiredai.com](https://mindwiredai.com/2026/03/25/claude-code-creator-workflow-claudemd/)

> **And the tactical version of that idea:**
>
> *"Almost all best practices boil down to one thing: Context Window management."*
>
> — [mindwiredai.com](https://mindwiredai.com/2026/03/25/claude-code-creator-workflow-claudemd/)

These aren't just tactics. They're how the senior side keeps showing up. Every technique in the rest of this guide — CLAUDE.md, Plan mode, subagents, `/clear`, hooks, MCP — is, at its core, a way to guide your pair and grow their usefulness over time.

---

## Section 1 — The Mindset Shift

### 1.1 The Senior/Junior Duality
- Claude is not a search engine and not an autocomplete. It's a pair — and the pair has two modes.
- **The senior side** brings breadth: every framework, every common pattern, fast execution, tireless recall of public knowledge.
- **The junior side** brings a blank slate on specifics: it doesn't know your code, your team's conventions, your customers, your last incident, or what you decided in Slack yesterday.
- Which side shows up is decided by the context you put in front of it. Thin context → junior. Rich, specific context → senior.
- Stop thinking "write this for me." Start thinking "work on this with me — and make sure the senior shows up."
- The collaboration loop: you provide judgment, direction, and the specific context the junior lacks; Claude provides breadth, execution, and tireless follow-through.

### 1.2 What to Delegate vs. What to Keep
- **Delegate:** boilerplate, research, first drafts, refactoring, test writing, debugging hypothesis generation
- **Keep:** architectural decisions, security review sign-off, product judgment, final acceptance
- Rule of thumb: "Would I review this before shipping?" → yes = Claude can do it, you review

### 1.3 Trust, Verification, and the Right Level of Autonomy
- Auto-accept mode is powerful — use it on well-scoped tasks with good tests
- The danger isn't Claude being wrong; it's you not noticing Claude was wrong
- Build verification into your workflow, not as an afterthought

### 1.4 You Are the Guide (and the Judge)
- The pair only works because you're feeding the junior side what it can't know. That's the guide role.
- And because you're the one accountable for what ships, you're also the judge — deciding what's good enough, what needs another pass, and what gets thrown out.
- Output quality scales with context quality. Thin context produces confident, wrong output — and that's on the guide, not the pair.
- How you guide: CLAUDE.md, codebase orientation, explicit constraints, Plan mode, subagents. Every one of these is a way to close the specificity gap.
- How Claude grows on your codebase: through the artifacts you build together. A new hire's memory lives in their head; Claude's memory lives in files you both can read. CLAUDE.md, the knowledge folder (see 3.1), lessons logs — these *are* the growth. Skip them and the junior never grows up.

---

## Section 2 — Setup & Configuration

Setup is how you equip your pair. Everything in this section is about closing the junior-side specificity gap before the first task — so the senior shows up by default and grows more useful from there.

### 2.1 The Global CLAUDE.md — Your Developer Baseline
- Lives at `~/.claude/CLAUDE.md` — loaded into *every* session on your machine, across every project
- This is where your *personal* engineering standards live, separate from any one repo's conventions
- What belongs here (vs. in a project CLAUDE.md): habits and discipline you want enforced *regardless of project*
- A strong baseline from [mindwiredai.com](https://mindwiredai.com/2026/03/25/claude-code-creator-workflow-claudemd/) covers six workflow rules:
  1. **Plan Mode Default** — enter Plan mode for any non-trivial task; re-plan when things go sideways
  2. **Subagent Strategy** — delegate liberally to keep the main context window clean
  3. **Self-Improvement Loop** — capture lessons after every correction so the same mistake doesn't recur
  4. **Verification Before Done** — never mark complete without proof; "would a staff engineer approve this?"
  5. **Demand Elegance (Balanced)** — pause for "is there a simpler way?" but skip on trivial fixes
  6. **Autonomous Bug Fixing** — given a bug report, just fix it; no context-switching back to the user
- Plus shared task-management discipline (plan → verify → track → document → capture lessons) and core principles (simplicity first, root causes over patches, minimal blast radius)
- Why this matters: project CLAUDE.md tells Claude *about the code*. Global CLAUDE.md tells Claude *how you work*. Both are necessary.
- Start with a baseline like the one above, then iterate as you notice your own corrections repeating

### 2.2 CLAUDE.md — Your Persistent Project Brain
- What it is: a file Claude reads at the start of every session
- What to put in it:
  - Project architecture overview
  - Coding conventions and style rules
  - Commands to know (build, test, lint, deploy)
  - Common pitfalls / things NOT to do
  - PR and commit conventions
- Start with `/init` to generate a baseline, then iterate
- Keep it short and human-readable — if you wouldn't read it, Claude shouldn't have to

### 2.3 Extending Claude's Reach — MCP, CLIs, and REST
- MCP is one option, not the only one. In practice Claude uses **CLIs and REST APIs just as often as MCP servers** — sometimes more, because they're already installed, already authenticated, and don't add a context-window tax.
- The right integration depends on the tool, the auth story, and how often Claude needs it. Don't default to MCP just because it exists.
- **The workflow:** ask Claude what's best *before* wiring anything up.
  - "I want you to be able to work with GitHub issues and PRs. What's the best way — MCP server, `gh` CLI, or REST? Trade-offs?"
  - Claude weighs the options (auth, capability, context cost, latency); you pick; then you give it that tool (install the CLI, add the MCP, drop API creds in `.env`, etc.)
- Rough heuristics Claude will usually surface:
  - **CLI** when one exists and is well-designed (`gh`, `aws`, `gcloud`, `kubectl`, `psql`, `stripe`) — zero context overhead, full power, real auth
  - **REST** for one-off or low-frequency calls where a CLI doesn't exist — `curl` + an API key is often simpler than standing up an MCP
  - **MCP** when you need structured tool definitions, the tool is used constantly, or the underlying API is awkward enough that a wrapper genuinely helps
- High-value integration targets (any flavor): GitHub, Slack/email, databases, internal APIs and docs, observability/log systems
- Setup pattern, regardless of flavor: install/configure → tell Claude it exists (in CLAUDE.md) → teach it when to reach for it

### 2.4 Plan Mode
- Back-and-forth in Plan mode is cheap; rework after a bad implementation is expensive
- Switch to auto-accept edits only after you like the plan
- **"How do I know it's a multi-step task?"** You usually don't up front — that's the point. A few heuristics:
  - **Watch for conjunctions and unknowns.** "Add a button" → just do it. "Add a button that posts to the API *and* updates the list" or "figure out where the auth flow lives *and then*…" → plan first. "And", "then", "also", and "figure out" are tells.
  - **More than one file? Plan.** Single-file tweaks rarely need it; cross-file changes almost always do.
  - **Ask Claude.** "Is this a one-shot task or should we plan it?" Claude will usually flag the multi-step cases honestly, and the question itself costs nothing.
  - **Notice the bail-out moment.** If you're interrupting Claude mid-execution to redirect, that *was* a planning task. Next time, plan first.

---

## Section 3 — Core Workflows

### 3.1 Starting a New Project

Greenfield is the one workflow in this section where there's no `/_knowledge` to read, no conventions to honor, and no CLAUDE.md yet — you're *creating* all of those alongside the code. That makes the junior-side risk different: it's not pattern mismatch, it's letting Claude make a hundred small structural decisions on autopilot that you'll regret in month three. The guide work here is front-loaded: feed Claude the requirements, pick the scaffolding deliberately, and stand up the knowledge artifacts from day one.

**Prereq — gather the requirements artifacts before you open Claude.** Every document that defines what you're building: the PRD, design docs, wireframes/Figma exports, API contracts, target user personas, non-functional requirements (perf budgets, compliance, accessibility), the "why now" context, and any explicit non-goals. Don't paraphrase them into a chat message — give Claude the actual artifacts. The single biggest failure mode in greenfield is Claude building a confident, plausible version of a thing that doesn't match what the stakeholders actually asked for, and that traces back to a thin verbal brief instead of the real docs.

**The pattern — a real new-project loop:**

1. **Hand Claude the full requirements package.** All of it, up front.
   > "Here are the artifacts for the new project: `<PRD>`, `<design doc>`, `<wireframes>`, `<API contract>`. Read everything. Then summarize back to me: what we're building, who it's for, what's explicitly out of scope, what the hard constraints are, and what's still ambiguous. Don't propose a stack or structure yet."
2. **Resolve the ambiguities before any technical decisions.** Whatever Claude flagged as unclear is what you go back to the PM/designer/stakeholder for. Don't let Claude guess past ambiguity at this stage — the cost of guessing wrong compounds.
3. **Pick the scaffolding approach deliberately.** Three reasonable paths, depending on the project's shape:
   - **Stack-native scaffolder** (`create-next-app`, `npm create vite`, `dotnet new`, `rails new`, `uv init`, `cargo new`) — fastest, gives you a working skeleton with sensible defaults. Best when the stack is decided and conventional.
   - **[GitHub spec-kit](https://github.com/github/spec-kit)** — spec-driven toolkit that turns requirements into structured specs, plans, and agent-executable tasks. Best when the spec is rich and you want the planning artifacts to persist as project documentation.
   - **[BMAD-METHOD](https://github.com/bmadcode/BMAD-METHOD)** — heavier agentic framework (PM/architect/dev agent roles) that produces detailed PRDs and architecture docs before code. Best for larger greenfield efforts where upfront architecture rigor pays off.
   - Ask Claude: "Given these requirements, which approach fits — stack-native scaffold, spec-kit, BMAD, or something else? Trade-offs." Then you decide.
4. **Plan the structural decisions in Plan mode.** Stack, top-level architecture, module boundaries, data model sketch, deployment target, what ships in the first slice. These decisions are expensive to undo; argue them in text.
5. **Stand up CLAUDE.md and `/_knowledge` on day one.** Don't wait until the codebase is "big enough." Have Claude generate an initial CLAUDE.md from the requirements and the chosen stack, and seed `/_knowledge` with one file per major area you know is coming (even if those files are stubs). The knowledge base is supposed to grow *with* the code, not be retrofitted onto it.
6. **Implement the first slice — small, end-to-end, deployable.** Resist the urge to scaffold everything. Get one thin vertical slice working (one user-facing capability, wired through every layer) before broadening. Same step-by-step discipline as 3.3: implement, review, verify, then the next slice.
7. **Update CLAUDE.md and `/_knowledge` as conventions emerge.** The first few slices are where your real conventions get set — naming, error handling, testing style, folder structure. Each time you make a decision, write it down. Future-you and future-Claude both need it.

**Why this shape works for greenfield specifically:**
- **Full requirements up front prevent confident wrong builds.** The most common greenfield failure is a beautiful implementation of the wrong thing. Real artifacts beat verbal briefs every time.
- **Deliberate scaffolding choice beats default-to-whatever-Claude-suggests.** The scaffold shapes the next year of work; spending ten minutes on the decision is cheap insurance.
- **Knowledge artifacts from day one means they actually exist later.** Retrofitting `/_knowledge` onto a 6-month-old codebase is the kind of task that never quite happens. Starting on day one makes it routine.
- **Thin vertical slices expose integration problems early**, when they're cheap to fix and before the architecture has calcified around the wrong assumptions.

**Prompting tips:**
- "Read all the requirements artifacts and tell me what's ambiguous before proposing anything."
- "Given these requirements, recommend a scaffolding approach — stack-native, spec-kit, BMAD, or other — with trade-offs."
- "Generate an initial CLAUDE.md from the requirements and the chosen stack. Include conventions we've decided on, even the tentative ones."
- "Stub `/_knowledge` files for the areas we know are coming. One file per area, even if it's just a description of what'll go there."
- "Build the thinnest possible vertical slice that exercises every layer. We'll broaden after it works end-to-end."

### 3.2 Working on an Existing Repo
**The problem:** Dropping Claude into an unfamiliar codebase cold is hiring a new senior engineer and pointing them at the repo with no onboarding. The breadth is real; the specificity is zero. You get generic, pattern-mismatched output. Claude needs orientation before it can be useful — and a one-time orientation isn't enough. The knowledge has to persist, because that persistence is how your pair grows from junior-on-this-codebase to senior-on-this-codebase.

**The quick start (first session):**
1. Run `/init` if there's no CLAUDE.md — it scans the repo and produces a usable baseline in seconds
2. Review the generated CLAUDE.md; add anything `/init` missed: deploy process, forbidden patterns, architectural invariants, team conventions
3. Ask Claude to map the relevant subsystem before touching anything: "Walk me through how auth flows from the login endpoint to session creation. Just describe it — don't change anything."
4. Once Claude has the lay of the land, scope your first task narrowly: one file, one behavior, one concern

**The deeper pattern — building a knowledge base:**

The CLAUDE.md baseline gets you started, but deep familiarity with a large codebase takes longer than one session. The fix is a dedicated knowledge repo: a clone of the project and a knowledge base that lives outside source control(this is generally easier for logistics reasons but there are ways to integrate it into source control if your whole team wants to share in it), used exclusively to accumulate structured understanding.

Why outside source control? Two reasons: the team may not be sharing this knowledge, and requiring a check-in for every update to the knowledge base creates enough friction that it doesn't happen.

*Setup (one time):*
1. Clone the repo into a separate local directory used only for knowledge work — not for feature branches
2. Open Claude at the root of that clone; run `/init` to generate the base CLAUDE.md
3. Tell Claude: "Break the app into its major functional areas and create a separate instructions file for each one in a new `/_knowledge` folder. Do not check this folder in."
4. Add to the CLAUDE.md: "Before answering any question or starting any task, read the relevant file in `/_knowledge`. After each conversation that adds to your understanding of a section, update that file."

*The learning pass (takes a few days):*
- Walk through each section of the app — feature areas and cross-cutting concerns (auth, startup, DI, error handling, data access) — one conversation at a time
- Don't rush. The goal is genuine understanding: ask why things are the way they are, not just what they are
- After each conversation, tell Claude: "Update the relevant instructions file with what we just covered"
- The knowledge base compounds — each session, Claude has more to work from and produces better output
- Together, you and Claude are building a shared understanding of the code

**Why the deep orientation matters:**
- Without it, Claude guesses at patterns and sometimes guesses wrong.  It also has to re-learn each time you work on something.  
- A 5-minute mapping step prevents a 30-minute "why did it write it this way?" rework
- The mapping conversation is diagnostic — if Claude can't explain a flow, that's a signal the codebase has implicit knowledge worth making explicit

### 3.3 Feature Building

Building a sizeable new feature inside an existing codebase has the same junior-side trap as everything else: drop Claude into "add a recommendations engine" cold and you'll get something that works in isolation but ignores how your app actually does data access, error handling, feature flags, and rollout. The fix is the same shape as the rest of this section — run the work from the knowledge repo so Claude understands the surrounding system before it writes a line of feature code.

**Prereq — the knowledge repo and the right CLIs.** This assumes the 3.2 setup: a separate clone with `/_knowledge` populated for the areas the feature will touch. You also want the work-tracker CLI (`gh`, `az repos`) so Claude can pull the feature spec/ticket and open the PR directly. If the feature touches an area that doesn't have a `/_knowledge` file yet, *build that file first* — feature work on top of thin knowledge produces thin features.

**The pattern — a real feature-building loop:**

1. **Sharpen the spec yourself, first.** Same rule as 3.4 bug fixing: ambiguity is your job, not Claude's. Get the spec to a state where the behavior, the non-goals, and the acceptance criteria are unambiguous. Talk to the PM, the designer, whoever owns the requirement. A fuzzy spec produces a confident, fuzzy feature.
2. **Hand off the spec + the setup in one shot.**
   > "Here's the feature spec: `<link>`. Get latest on `dev`, start a feature branch, then read the relevant files in `/_knowledge` for the areas this touches. Don't plan yet — first tell me what existing patterns and code this will interact with."
3. **Confirm the orientation.** Claude reports back on what it found: the modules involved, the conventions in play, the seams to extend. Push back where it missed something; fill in context it couldn't have (the half-finished refactor next door, the deprecation in flight, the perf constraint that isn't documented).
4. **Plan the feature — in Plan mode.** Now ask for the plan. For a sizeable feature, expect to iterate several rounds. Argue about decomposition, interfaces, where to put the seams, what to ship behind a flag, what to defer. Resolve disagreements in text before there's a diff to defend.
   - For non-trivial features, ask Claude to break the plan into commit-sized steps you can review independently.
5. **Be explicit about what NOT to build.** Constraints are as important as requirements.
   > "Don't add a new abstraction for X — use the existing `FooService`. Don't handle auth errors here; the middleware does it. No telemetry yet, that's a follow-up."
6. **Greenlight implementation — with tests, step by step.** For a larger feature, don't let Claude run the whole plan in one go. Implement step 1, review, then step 2. This keeps the diff reviewable and the blast radius small.
   > "Implement step 1 from the plan, with unit tests. Stop when it's done — don't start step 2."
7. **Review the diff — do the due diligence.** Same judge role as 3.4: read everything, scrutinize the tests against the spec's *intent* (not just coverage), ask Claude to walk you through anything unfamiliar until you could defend it in review.
8. **Verify the feature end-to-end.** Tests passing isn't the same as the feature working. Run the app, exercise the golden path and the obvious edge cases, watch logs. If the change is UI, see it in a browser.
9. **Open the PR in draft, then publish.** Same as 3.4 — draft for one more pass in a different surface, then mark ready for review.
10. **Close the loop into `/_knowledge`.** If the feature introduced a new pattern, a new module, or a decision worth remembering, update the relevant knowledge file. The next feature in this area starts smarter because of it.

**Why this shape works for features specifically:**
- **Knowledge-base orientation prevents pattern drift.** New features are the most common way codebases accumulate inconsistency. Making Claude read `/_knowledge` first keeps the feature inside the grain of the existing code.
- **Step-by-step implementation keeps reviews honest.** A 2,000-line diff gets rubber-stamped; ten 200-line diffs get actually read.
- **The knowledge base compounds across features.** Every feature is a chance to improve `/_knowledge` for the area it touched — the second feature in a subsystem is meaningfully easier than the first.

**Prompting tips:**
- "Before planning, read `/_knowledge/<area>.md` and the relevant code, then tell me what existing patterns this should follow or extend."
- "Break the plan into commit-sized steps. I want to review each step before you start the next."
- "Don't add error handling for X — the framework handles it. Don't build a config surface; hardcode it for now."
- "Use subagents for isolated exploration — spike the third-party integration in a subagent so it doesn't pollute our main context."

### 3.4 Bug Fixing

Bug fixing and debugging are *related but separate* workflows. Bug fixing (this section) assumes you already know — or have been told — what's wrong and what "fixed" looks like. Debugging (3.5) is the diagnostic work that produces that understanding when you don't have it yet. Don't conflate them; the loops are different.

**Prereq — equip the pair once.** Make sure Claude has the right CLI installed and authenticated for wherever your work tracker and repo live (`gh` for GitHub, `az repos` for Azure DevOps). With the CLI in hand, Claude can pull bug details, check out branches, and open PRs directly — no copy-paste, no MCP tax. Note it in CLAUDE.md so Claude knows to reach for it.

**The pattern — a real bug-fix loop:**

1. **Check the requirements yourself, first.** Open the bug. Are the requirements clear enough to act on? If not, this is *your* work — go talk to the business analyst (or whoever owns the spec) and get the bug to a state where the acceptance criteria are unambiguous. Don't hand Claude a fuzzy bug; you'll just get a confident, fuzzy fix.
2. **Hand off the bug + the setup.** Once requirements are solid, give Claude the link and the setup instructions in one shot:
   > "Here's the bug: `<link>`. Get latest on the `dev` branch in the build repo, start a feature branch for this bug, then make a plan. Don't implement yet."
3. **Discuss the plan.** Claude pulls the bug details via the CLI, reads the relevant code, and proposes a plan. Push back where it's wrong, fill in context it couldn't have, tighten scope. Iterate until you'd approve the plan as-is.
4. **Greenlight implementation — with tests.**
   > "Looks good. Implement it, and include comprehensive unit tests."
5. **Review the diff — do the due diligence.** Read what Claude wrote and understand *everything* in it. This is the time to discuss the code *with* Claude, not just skim it.
   - **You still own this code.** Claude may have acted as a search engine or Stack Overflow for you — pulling in a piece of syntax you didn't know or an implementation pattern that's new to you. That's a perfectly good use of the pair. But the moment it lands in your branch, *you* own it. Understand it, judge it against your quality gates, and verify it adheres to them. Ask Claude to walk you through anything unfamiliar until you could defend it in a code review yourself.
   - **Scrutinize the tests as carefully as the fix.** Claude is genuinely excellent at unit tests and edge-case coverage — better than most developers, honestly. That's a gift, not a free pass. Read every test. Understand every edge case it covers. Then ask the question only you can answer: *do these edge cases match the intent of the requirements?* Coverage that's technically thorough but semantically off-target is worse than no coverage, because it ships with false confidence.
   - This is the judge role. Don't skip it, and don't rush it.
6. **Open the PR in draft.**
   > "Create the PR with a good description. Set it to draft mode so I can do one more review before publishing for approval."
7. **Final review, then publish.** Re-read in the PR view (different surface, different mistakes catch the eye), then mark ready for review.

**Why this shape works:**
- **Requirements clarification stays human.** Claude can't talk to your BA. Owning that upstream prevents the whole loop from being wasted.
- **Plan-before-implement keeps cheap iterations cheap.** Disagreements about approach get resolved in text, not in a diff.
- **Draft PR is a built-in second review.** The PR view shows the change in a different frame than the editor — you'll catch things you missed.
- **The CLI does the boring parts.** Branch creation, PR opening, description-writing — Claude handles the mechanics so you stay on judgment.

### 3.5 Debugging

Debugging is diagnostic work: something is misbehaving and you don't yet know *why*. The junior side of Claude can't help here on its own — without runtime evidence it can only guess plausibly. Your job as the guide is to put real signals in front of it.

**Prereq — equip the pair with telemetry access.** Ideally, give Claude direct access to your observability provider via MCP or CLI (Datadog, Azure Application Insights, Sentry, Honeycomb, Grafana, etc.). With that wired up, Claude can pull traces, logs, exception groups, and metrics on its own instead of waiting for you to paste them in.

- **If the provider has an MCP server or CLI, use it.** Install/configure, authenticate, and note it in CLAUDE.md.
- **If not, fall back to copy-paste.** Give Claude the stack trace, the failing request ID, screenshots of dashboards, log excerpts, repro steps — every artifact you have. Verbose is fine; missing context is not.
- **Consider building a skill for it.** If your team uses a specific telemetry provider constantly, a small skill that encodes "how we query Datadog for a given service/timeframe" turns repeated guidance into one-line invocations.
- **Add a knowledge file for the deploy/ops environment.** A `/_knowledge/devops.md` (or similar) describing your environments, deploy topology, where logs live, which dashboards matter, on-call runbooks, and known-weird behaviors closes the biggest junior-side gap in debugging.

**The pattern — a real debugging loop:**

1. **State the symptom and point at the signals.** Give Claude what's broken and where to look:
   > "Users are seeing 500s on `/checkout` since the 14:00 deploy. Look at the App Insights resource `prod-web-api`, filter to the last 2 hours, and find the exception pattern. Don't propose a fix yet."
2. **Ask for hypotheses, not fixes.** Hold the line here — the cost of a wrong fix is much higher than the cost of one more diagnostic round.
   > "Give me the top 3 root cause hypotheses, ranked by likelihood, with the evidence from telemetry that supports each one."
3. **Pick a hypothesis and validate it.** Have Claude pull whatever additional signal would confirm or kill the leading theory — a specific trace, a correlated log line, a metric over time.
4. **Confirm the root cause in code.** Once telemetry points at a suspect, have Claude trace it through the code to show the exact line/state where things go wrong. *This* is the hand-off point to the bug-fix loop in 3.4 — you now have a clear bug with clear requirements.

**Prompting tips:**
- "Don't fix it yet — what are the 3 most likely root causes, with telemetry evidence for each?"
- "Pull the failing trace for request ID `<id>` and walk me through it."
- "Compare error rates on this endpoint before and after the 14:00 deploy."
- "Show me the exact line where the state goes wrong."

**Why the separation from bug fixing matters:**
- Debugging is a *learning* loop — you're reducing uncertainty. Bug fixing is an *execution* loop — you're applying a known fix. Trying to do both in one prompt collapses the diagnostic discipline; you get a fix to a symptom, not a cause.
- The artifacts are different. Debugging produces understanding (and often a new entry in `/_knowledge/devops.md` or a lessons file). Bug fixing produces a PR.

### 3.6 Code Review

Reviewing someone else's PR has the same junior-side problem as everything else: a Claude pointed at a raw diff with no surrounding context will give you generic feedback that could apply to any codebase. The fix is to run the review *from the place where Claude already understands the code* — the knowledge repo you built in 3.1.

**Prereq — the knowledge repo and the right CLI.** This workflow assumes you've done the 3.2 setup: a separate clone of the project with a `/_knowledge` folder and a CLAUDE.md that tells Claude to read the relevant section before answering. You also need the CLI for your code host (`gh`, `az repos`) so Claude can fetch branches and PR metadata on its own.

**The pattern — a real code review loop:**

1. **Switch to the knowledge repo and pull the branch down to a build branch.** Don't review in your feature workspace; review where the knowledge lives.
   > "Switch to the `dev` branch, pull latest, then check out the PR branch `feature/checkout-rework` into a local branch called `review/checkout-rework`. Don't analyze anything yet."
2. **Orient Claude using the knowledge base.** Make it read before it reviews.
   > "This PR touches checkout and payments. Read the relevant files in `/_knowledge` first so you understand how these areas are supposed to work, then summarize what this PR changes relative to that baseline. No judgments yet — just: what's different."
3. **Run the structured review passes.** Use the built-in skills, one concern at a time, so the feedback is focused instead of a wall of mixed observations.
   - `/review` for correctness, design, and adherence to the patterns documented in `/_knowledge`
   - `/security-review` for security-specific issues
   - Run them as separate passes; each produces a tighter, more actionable report than a single "review everything" prompt
4. **Discuss the findings — judge, don't rubber-stamp.** Claude will surface real issues *and* things that look wrong but are intentional in your codebase. The knowledge files help, but you're still the final filter. Push back where Claude is being pedantic; dig deeper where it's flagged something you don't fully understand.
5. **Post the review.** Once you've decided which findings are real, have Claude post them as PR comments via the CLI — either inline on specific lines or as a single review summary, depending on your team's norm.

**Why running it from the knowledge repo matters:**
- **Reviews are judged against patterns, not in a vacuum.** "This doesn't match how auth is done elsewhere" is only possible if Claude knows how auth is done elsewhere.
- **The knowledge base improves from reviews too.** If the PR introduces a new pattern the team has agreed to, that's a `/_knowledge` update — the review loop and the learning loop reinforce each other.
- **Separating review from your active feature work** keeps the contexts clean. You don't want your in-progress branch's state coloring how Claude reads someone else's diff.

### 3.7 Documentation & Planning

Documentation has the same junior-side trap as review: ask a context-less Claude to "write the README" and you'll get something that's technically accurate, generically structured, and disconnected from how the system actually fits together. The knowledge repo solves the same problem here — Claude documents *better* when it's already spent time understanding the area.

**Prereq — the knowledge repo, again.** Run documentation work from the same clone you set up in 3.2, with `/_knowledge` populated for the areas you're documenting. If the area you're about to document doesn't have a knowledge file yet, *write the knowledge file first*. The act of building it is the act of understanding the system well enough to document it for anyone else.

**The pattern — a real documentation loop:**

1. **Orient Claude before drafting.** Same move as review: make it read first.
   > "I want to write a README for the checkout subsystem. Read `/_knowledge/checkout.md` and the relevant code, then tell me what the README should cover and in what order. Don't draft yet."
2. **Agree on the outline.** Argue about structure in text, before there's a draft to defend. This is the doc-writing equivalent of Plan mode.
3. **Get a first draft — and treat it as a draft.** Claude is fast at first drafts and almost never right on the first pass for tone, emphasis, or audience.
   > "Draft it now. Aim for a developer new to this codebase — assume they know the language but nothing about our domain."
4. **Edit for judgment and context.** Add the things Claude can't know: why decisions were made, which parts are load-bearing, what's about to change, what the team has tried and rejected. This is the judge role for docs.
5. **Close the loop into `/_knowledge`.** If the doc surfaced something the knowledge file didn't have, update the knowledge file. Docs and `/_knowledge` should drift toward each other, not apart.

**Use cases this shape fits:**
- READMEs and onboarding docs (knowledge file → outline → draft → edit)
- ADRs — give Claude the decision, the alternatives considered, and the constraints; let it structure the record
- Specs from a rough idea — same loop, just earlier in the lifecycle
- PR descriptions from a diff — the lightweight version; usually one prompt is enough
- Diff-driven doc updates — point Claude at the diff and the existing docs, ask what needs to change

**Why running it from the knowledge repo matters:**
- **Docs written against a knowledge base sound like the team wrote them**, not like an AI summarized the code. The voice and emphasis come from the knowledge file you curated.
- **It forces the honest version of "do we actually understand this?"** If `/_knowledge` is thin on the area, the doc will be thin too — and that's useful signal, not a failure.
- **The artifacts compound.** Every doc pass is a chance to improve `/_knowledge`; every `/_knowledge` improvement makes the next doc pass faster and sharper.

---

## Section 4 — Advanced Patterns

Up to this point the framing has been pairing — you and one Claude on one problem. Advanced patterns are the same skill at higher leverage: as your guiding gets better, you graduate from pairing with one Claude to *directing* several. Subagents, parallel worktrees, hooks, and crons are how a good guide multiplies. The accountability doesn't change; the headcount does.

### 4.1 Subagents & Parallel Sessions
- Subagents: specialized Claude instances with their own context windows
- Use them for: research that would pollute your main context, parallel exploration, domain-specific expertise
- Pattern: main Claude orchestrates, subagents execute isolated tasks, results flow back
- Worktrees + parallel sessions: run multiple Claude instances on the same repo simultaneously

### 4.2 Agentic Automation (Hooks, Crons, Background Agents)
- Hooks: reactive automation (event → Claude action)
- Crons: scheduled agents that run at intervals without you
- Use cases:
  - Nightly dependency audit
  - Auto-triage incoming GitHub issues
  - PR description generation on push
  - Monitoring alert → diagnosis → Slack summary

### 4.3 Context Window Management
- Don't wait for auto-compaction (lossy, fires at ~83% capacity)
- At ~60% context: dump current plan to a markdown file, `/clear`, restart with that file
- Use subagents to do research without consuming your main window
- CLAUDE.md + well-named files = context that persists across sessions for free

### 4.4 Claude API / SDK Integration
- When to use the API vs. Claude Code: automation, integrations, custom tooling, CI/CD
- Key capabilities: tool use, prompt caching, streaming, batch processing
- Prompt caching: cache your large context (system prompt, codebase excerpt) — saves tokens on repeated calls
- Pattern: Claude Code for interactive dev, API for headless/automated workflows

---

## Section 5 — Team Adoption

### 5.1 Starting as a Team
- One CLAUDE.md in the repo root, committed to git — everyone gets the same context
- Document team-specific things: PR conventions, deploy process, forbidden patterns
- Start with one workflow (e.g., PR descriptions) to build trust before going deeper

### 5.2 Shared Conventions
- Agree on: what Claude can auto-accept vs. what always needs human review
- Agree on: which MCP servers are approved / configured in the org
- Agree on: how to attribute AI-assisted work in PRs and commits

### 5.3 Measuring Impact
- Leading indicators: time-to-PR, review cycles, test coverage trends
- Lagging indicators: bug rate, deploy frequency, onboarding time
- Qualitative: developer satisfaction, cognitive load on repetitive tasks

### 5.4 Common Failure Modes — The Junior Who Never Grew
Every failure mode here is the same root cause: the guide work stopped (or never started), so the junior side keeps showing up, confidently, forever.
- **Trusting output without reading it** (especially security-sensitive code) — the judge role got skipped
- **Using Claude for architectural decisions without human sign-off** — handing a junior decisions that need a senior with team context
- **Not maintaining CLAUDE.md** → Claude gets progressively more confused as the code drifts away from what its memory says is true
- **No `/_knowledge` discipline** → every session re-onboards from zero; the new hire never reaches week six
- **Over-automating before trust is established** — directing a fleet of Claudes before you can reliably guide one

---

## Section 6 — Quick Reference

### The Claude Code Command Cheat Sheet
| What you want | How |
|---|---|
| Initialize project context | `/init` |
| Plan before implementing | Plan mode (`/plan`) |
| Reset context cleanly | `/clear` |
| Configure automation | `/update-config` |
| Review a PR | `/review` |
| Security audit | `/security-review` |
| Schedule recurring agent | `/schedule` |

### Prompting Patterns That Work
- "Don't implement yet — give me a plan first"
- "What are the top 3 risks with this approach?"
- "Review this for [specific concern] only"
- "Here's the spec. Here's what NOT to build."
- "Run the tests and tell me what's failing before touching anything"
- "What's the simplest possible version of this?"

### The Setup Checklist
- [ ] CLAUDE.md in repo root with architecture, conventions, commands
- [ ] MCP servers configured for your team's key tools
- [ ] Permissions tuned (auto-allow read-only, prompt on writes to sensitive paths)
- [ ] Hooks set up for your most repetitive reactions
- [ ] Plan mode habit established for tasks with 3+ steps

---

## Workshop Agenda (2-hour session)

| Time | Activity |
|---|---|
| 0:00–0:15 | Intro — the mindset shift (Section 1, no hands-on) |
| 0:15–0:30 | Setup lab — CLAUDE.md + `/init` on a real project |
| 0:30–0:50 | Core workflows lab — participants choose one: feature, bug, or review |
| 0:50–1:00 | Break + Q&A |
| 1:00–1:20 | Advanced patterns — Plan mode deep dive + parallel sessions demo |
| 1:20–1:40 | Team adoption — shared CLAUDE.md exercise, conventions discussion |
| 1:40–2:00 | Open lab + troubleshooting + next steps |

**Pre-work for participants:** Install Claude Code CLI, bring a real project or use the provided sample repo.

---

*Last updated: 2026-05-25*
