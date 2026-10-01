# DevShelf — Project State & Skill Progress Tracker

**Read this file first, every session.** It is the single source of truth
for what exists in the codebase, what's been mastered, and what's next.
Update it at the end of every session — Copilot should remind the user to
do this before closing out.

---

## How to use this file

- **Status** column: ⬜ Not started · 🔶 In progress · ✅ Complete (passed quiz)
- Update status the moment a topic's quiz (Rule 3 in copilot-instructions.md)
  is actually passed — not when code is merely deployed.
- When a feature is added to the codebase, list it under "Current Features"
  immediately, even mid-topic, so Copilot never re-explains something that
  already exists.

---

## Current Features in Codebase

*(Update this list every time something is added/changed. This is what
Copilot checks before assuming what does/doesn't exist yet.)*

| Feature | Where it lives | Related Topic # |
|---|---|---|
| Login / Registration | `server/Controllers/AuthController.cs` | (baseline) |
| Protected User Profile | `server/Controllers/ProfileController.cs` | (baseline) |
| Health Check | `server/Controllers/HealthController.cs` | (baseline) |
| CRUD for Resources | `server/Controllers/ResourcesController.cs` | (baseline) |
| CRUD for Snippets | `server/Controllers/SnippetsController.cs` | (baseline) |
| CRUD for Tasks (+ PATCH status) | `server/Controllers/TasksController.cs` | (baseline) |
| Interactive Scalar API Docs | `server/Program.cs` (`/scalar/v1`) | (baseline) |
| *(add new rows as features are built)* | | |

---

## Skill Progress Map

| # | AZ-204 Domain | Feature | Concepts | Cost Risk | Status |
|---|---|---|---|---|---|
| 1 | Compute (App Service) | Proper App Service deploy — slots, config, scaling | App Service plans, slots, scale-out vs up | 🟢 Safe | ✅ |
| 2 | Storage | Blob Storage — image uploads + SAS tokens | Containers, access tiers, SAS, lifecycle policies | 🟢 Safe | ✅ |
| 3 | Security | Key Vault + Managed Identity | Managed Identity, RBAC, access policies | 🟢 Safe | ✅ |
| 4 | Security (auth) | Microsoft Entra ID / MSAL login | OAuth2/OIDC, tokens, App Registrations, scopes | 🟢 Safe | ⬜ |
| 5 | Storage (NoSQL) | Cosmos DB container (e.g. activity log) | Partition keys, RU/s, consistency levels | 🟡 Watch | ⬜ |
| 6 | Containers | Dockerize + Azure Container Apps | ACR, container images vs App Service model | 🟡 Watch | ⬜ |
| — | **Security audit pass #1** | Review topics 1–6 for exposed secrets/RBAC issues | — | — | ⬜ |
| 7 | Compute (event-driven) | Azure Function on registration event | Triggers/bindings, consumption vs premium | 🟢 Safe | ⬜ |
| 8 | API Management | APIM in front of the API | Policies, rate limiting, versioning | 🔴 High — deploy/delete same session | ⬜ |
| 9 | Messaging | Service Bus/Queue for CRUD events | Queue vs Topic, delivery guarantees, dead-lettering | 🟢 Safe | ⬜ |
| 10 | Monitoring | Application Insights + deliberate break/trace | Distributed tracing, telemetry, KQL basics | 🟡 Watch | ⬜ |
| — | **Security audit pass #2** | Review topics 7–10 | — | — | ⬜ |
| 11 | Caching | Azure Cache for Redis on hot-read endpoint | Cache-aside pattern, TTL, invalidation | 🔴 High — deploy/delete same session | ⬜ |
| 12 | IaC | Convert manual setup to Bicep | Idempotency, parameters/modules | 🟢 Safe | ⬜ |
| 13 | CI/CD | GitHub Actions pipeline | CI/CD stages, pipeline secrets, environment promotion | 🟢 Safe | ⬜ |
| — | **Security audit pass #3 (final)** | Full project review, all topics | — | — | ⬜ |
| — | **Cumulative mastery review** | Quiz across ALL topics, no notes | — | — | ⬜ |

---

## Diagrams Produced

*(Rule 5 — no "how" step for a topic is valid without a saved diagram file)*

| Topic # | Diagram file | Status |
|---|---|---|
| 1 | `diagrams/01-app-service.png` | ✅ |
| 2 | `diagrams/02-blob-storage.png` | ✅ |
| 3 | `diagrams/03-keyvault-identity.png` | ✅ |
| 4 | `diagrams/04-entra-id-auth.png` | ⬜ |
| 5 | `diagrams/05-cosmosdb.png` | ⬜ |
| 6 | `diagrams/06-containers.png` | ⬜ |
| 7 | `diagrams/07-functions-events.png` | ⬜ |
| 8 | `diagrams/08-apim.png` | ⬜ |
| 9 | `diagrams/09-messaging.png` | ⬜ |
| 10 | `diagrams/10-monitoring.png` | ⬜ |
| 11 | `diagrams/11-caching.png` | ⬜ |
| 12 | `diagrams/12-bicep-iac.png` | ⬜ |
| 13 | `diagrams/13-cicd.png` | ⬜ |
| — | `diagrams/00-full-architecture.png` (final, whole system) | ⬜ |

---

## Cumulative Review Log

*(Rule 7 — every 3–4 topics, log a review here so gaps are visible over time)*

| Review # | Topics covered | Date | Result / concepts needing revisit |
|---|---|---|---|
| 1 | Topics 1–4 | | |
| 2 | Topics 5–8 (+ audit pass #1) | | |
| 3 | Topics 9–11 (+ audit pass #2) | | |
| Final | All topics 1–13 (+ audit pass #3) | | |

---

## Job-Readiness Checklist

*(Copilot: do not confirm the user is "ready" until every box below is true)*

- [ ] All 13 topics marked ✅ in the Skill Progress Map
- [ ] All 3 security audit passes complete
- [ ] Final cumulative mastery review passed with no major gaps
- [ ] Full architecture diagram (`00-full-architecture.png`) exists and
      user can explain it from memory
- [ ] User can redeploy the entire project from a blank Azure subscription
      by following their own Bicep templates + CI/CD pipeline
- [ ] All 🔴 high-risk resources have been torn down (nothing left running
      that isn't needed)

Once this is fully checked, this project (DevShelf) has served its purpose
as an AZ-204 concept mastery vehicle. The AI-200 / AI concepts continue in
the separate project, using the same mentor-mode and progress-tracking
pattern.
