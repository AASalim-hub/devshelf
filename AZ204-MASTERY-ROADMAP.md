# DevShelf → AZ-204 Mastery Roadmap
### Architecture-first learning with Copilot as tutor, not implementer

---

## How this project's files work together

This roadmap is one of three files that work as a system — don't use it alone:

| File | Purpose |
|---|---|
| `.github/copilot-instructions.md` | **Auto-loaded by GitHub Copilot** every time you open this repo in VS Code. Contains the enforced mentor-mode rules, guardrails, and behavior — you do NOT need to paste a prompt manually anymore. |
| `PROGRESS.md` | The **living state tracker**. Copilot reads this every session to know what's built, what's mastered, and what's next. Update it as you go. |
| `AZ204-MASTERY-ROADMAP.md` (this file) | The reference plan — domain coverage, cost awareness, and the guardrails explained in full (in case you want the reasoning behind the rules). |

**Setup (one time):** drop `.github/copilot-instructions.md` and `PROGRESS.md` into your DevShelf project root, alongside this file. GitHub Copilot in VS Code automatically picks up `.github/copilot-instructions.md` as repo-level custom instructions — no manual pasting needed at the start of each session.

Use **Copilot Chat**, not inline autocomplete, for the architect/concept/why steps. Only lean on inline suggestions during "the how," and even then, read every suggestion before accepting.

---

## Guardrails — why they exist

These were added after auditing the original plan for loopholes. Full enforcement logic lives in `copilot-instructions.md`; here's the reasoning:

| Loophole in the original plan | Guardrail that closes it |
|---|---|
| Mentor-mode only worked if manually pasted each session | `copilot-instructions.md` is auto-loaded — no re-pasting, no forgetting |
| Quiz step had no pass/fail consequence | Rule 3: 2+ wrong answers blocks progression until re-taught and re-quizzed |
| User could type "just write the code" and collapse the whole system | Rule 2 ("shortcut tax"): code is allowed, but deployment is blocked until it's explained back |
| Copilot could state outdated Azure facts (pricing, SKUs) as current | Rule 4: uncertainty must be flagged explicitly, user told to verify on Microsoft Learn |
| "Diagram" step was just a chat description, never a real artifact | Rule 5: no "how" step begins without a saved diagram file in `/diagrams` |
| No mechanism to prevent leaving 🔴 resources running and burning credit | Rule 6: cost-awareness baked in, hourly-billed resources flagged and torn down same session |
| Early topics could be forgotten by the time later topics are reached | Rule 7: cumulative review quiz every 3–4 topics |
| No check for security drift (open storage, over-permissioned identities) | Rule 8: dedicated security audit pass after clusters of topics |
| Features could be added that don't map to any real skill gap | Rule 9: every feature must map to a domain in `PROGRESS.md`, or Copilot flags it |
| "Mastery" and "job-ready" were vague, undefined end states | Rule 10 + Job-Readiness Checklist in `PROGRESS.md`: concrete, checkable completion criteria |

---

## Full AZ-204 Domain Coverage Map (via DevShelf)

> **Note:** `PROGRESS.md` is the live, editable version of this table (with
> status checkboxes, current features, and diagram tracking). This copy
> stays static as the reference plan — update status in `PROGRESS.md`, not
> here, so the two never drift out of sync.

Work through these roughly in order. Each row = one deployable milestone. Don't move to the next until you've deployed, broken, and fixed the current one at least once.

| # | AZ-204 Domain | DevShelf Feature to Build | Core Concepts You'll Master | Cost Risk |
|---|---|---|---|---|
| 1 | Develop for Azure compute | Deploy current DevShelf to App Service properly (deployment slots, config via App Settings, scaling rules) | App Service plans, slots (blue/green), scale-out vs scale-up | 🟢 Safe — use Free (F1) or Basic (B1) tier |
| 2 | Azure Storage | Blob Storage for avatar/item image uploads + SAS tokens | Containers, access tiers, SAS vs public access, lifecycle policies | 🟢 Safe — Blob Storage has a generous free monthly grant + pennies per GB |
| 3 | Implement Azure security | Move secrets to Key Vault, access via Managed Identity | Managed Identity (system vs user-assigned), RBAC, Key Vault access policies | 🟢 Safe — Key Vault operations are near-free at low volume |
| 4 | Implement Azure security (auth) | Replace custom login with Microsoft Entra ID / MSAL | OAuth2/OIDC flow, tokens, App Registrations, scopes | 🟢 Safe — Entra ID free tier covers this entirely |
| 5 | Develop for Azure storage (NoSQL) | Add a Cosmos DB container for a new entity (e.g. activity log) | Partition keys, RU/s, consistency levels, SQL API basics | 🟡 Watch it — use Cosmos DB **free tier** (1000 RU/s + 25GB free) explicitly; don't create a second account |
| 6 | Implement containerized solutions | Dockerize DevShelf, deploy to Azure Container Apps | Container registries (ACR), container images vs App Service model | 🟡 Watch it — ACR Basic tier is cheap (~$0.17/day); Container Apps has a free monthly grant but scale-to-zero must be configured |
| 7 | Develop Azure compute (event-driven) | Add Azure Function triggered by new user registration (e.g. welcome email) | Triggers/bindings, consumption vs premium plan, function scaling | 🟢 Safe — Consumption plan has a large free monthly grant; avoid Premium plan for learning |
| 8 | Implement API Management | Put DevShelf's API behind APIM | Policies, rate limiting, API versioning, subscription keys | 🔴 High risk — even the cheapest APIM tier bills **hourly** whether used or not; deploy last, test same-day, **delete immediately after** |
| 9 | Message-based solutions | Fire event on CRUD action → Service Bus/Queue → consumed by Function | Queue vs Topic, at-least-once delivery, dead-lettering | 🟢 Safe — Service Bus Basic tier / Storage Queues are pennies at low volume |
| 10 | Monitor, troubleshoot, optimize | Wire up Application Insights, deliberately break something and trace it | Distributed tracing, custom telemetry, log queries (KQL basics) | 🟡 Watch it — first 5GB of ingested logs/month is free; disable verbose logging after the exercise |
| 11 | Implement caching | Add Azure Cache for Redis on a hot-read endpoint | Cache-aside pattern, TTL, cache invalidation | 🔴 High risk — **no free tier**, bills hourly from creation; deploy, learn, **delete same session** |
| 12 | Automate infrastructure | Convert manual resource setup into Bicep templates | IaC principles, idempotency, parameters/modules | 🟢 Safe — Bicep itself is free; cost = whatever resources it deploys (reuses above) |
| 13 | Automate deployment | GitHub Actions pipeline: build → test → deploy on push | CI/CD stages, secrets in pipelines, environment promotion | 🟢 Safe — GitHub Actions free minutes cover this; Azure side only bills for what's deployed |

**Legend:** 🟢 Safe to leave running for days · 🟡 Fine short-term, monitor it · 🔴 Bills by the hour regardless of use — deploy, learn, tear down same session

---

## Cost-Awareness Rules (give these to Copilot as standing context)

Add this to your mentor-mode prompt or as a pinned note in your Copilot session so it always factors cost into its guidance:

```
Budget context: I'm on an Azure for Students subscription with a limited
annual credit (check exact figure in the Azure portal — historically ~$100/
year, verify current amount). I cannot afford to leave paid resources running
idle. Whenever you propose a resource or SKU:
1. Tell me if a free tier exists for it, and use that tier by default.
2. Flag clearly if the resource bills hourly regardless of usage (e.g. APIM,
   Redis, AKS, VMs) — these must be deployed, used, and deleted in the same
   session unless I say otherwise.
3. Before any "how" (implementation) step, remind me to check Azure Cost
   Management for current spend if we're touching a 🟡 or 🔴 risk resource.
4. When we're done with a topic for the day, remind me to tear down anything
   we don't need running until the next session.
```

**Extra safety nets to set up once, at the start:**
1. **Budget alerts** — in Azure Cost Management, set alerts at 25%, 50%, 80% of your credit
2. **Resource group per topic** — create a new resource group for each roadmap topic (e.g. `rg-devshelf-keyvault`, `rg-devshelf-apim`) so you can delete an entire topic's resources in one command when done: `az group delete --name rg-devshelf-apim --yes`
3. **Tag everything** with a `learning-topic` tag so Cost Management can show you spend per topic, not just total spend
4. **End-of-session checklist**: before closing for the day, ask yourself "is anything from today's 🟡/🔴 resources still running that I don't need until next time?"

---

## Suggested Weekly Rhythm

- **1 topic per week** (adjust pace to your schedule) — rushing defeats the "mastery" goal
- Each week: Architect (Mon) → Concepts + Diagram (Tue) → Why (Wed) → How/Build (Thu-Fri) → Deploy + Break + Fix + Quiz (weekend)
- Keep a running "concept journal" — one paragraph per topic in your own words, written *after* the quiz step, not before. If you can't write it without checking notes, you're not done with that topic yet.

---

## When DevShelf Is "Done"

You'll know you've completed AZ-204 mastery via DevShelf when you can, without notes:
- Draw the full architecture diagram from memory, including trust boundaries and data flow
- Explain why each Azure service was chosen over its alternatives
- Explain what breaks (and why) if any single component is removed
- Walk someone else through deploying it from a blank Azure subscription

At that point, DevShelf becomes a strong portfolio piece *and* your AZ-204 concept mastery is genuinely demonstrated — not just memorized for a multiple-choice exam.
