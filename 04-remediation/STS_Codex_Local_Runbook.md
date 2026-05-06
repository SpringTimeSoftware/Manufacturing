# STS Manufacturing ERP — Local Codex Runbook

## Decision
You do **not** need to run `Codex_R002_MasterData_V2_Canonical_Domain_Map_Prompt.txt` separately.

Because **Overnight Batch A** already:
- starts from **R002**,
- runs **R002 through R009** in order,
- tells Codex to create any missing prompt files under `/04-remediation/prompts/`, and
- is **documentation-only**.

So the correct starting point now is:
**Run Overnight Batch A first.**

---

## Current repo rules already locked in
- The original prompt chain is frozen at **P063**.
- **P064 must not run** until **R001-R013** are complete.
- The manufacturing execution backbone must be preserved.
- R001 was documentation-only and made no runtime code changes.

---

## Local-only workflow (no GitHub needed)

### Step 0 — Safety
In the repo root:

```bash
git status
git branch --show-current
```

You should be on:

```text
gap-remediation-v2
```

If not:

```bash
git checkout gap-remediation-v2
```

Optional but recommended:

```bash
git add -A
git commit -m "Checkpoint before Batch A"
```

---

## Step 1 — Use a new Codex thread
Do **not** continue the old/sticky chat.
Start a **new Codex chat** attached to this repo.

If Codex offers **Local** vs **Worktree**, choose **Worktree** if available.
If not, Local is acceptable for this docs-only batch.

---

## Step 2 — Paste Batch A exactly
Paste the contents of this file into the new Codex chat:

- `Codex_Overnight_Batch_A_R002_R009.txt`

That is the only prompt you need for tonight.

Do **not** paste the standalone R002 prompt first.
Do **not** run R010, R011, R012, R013, or P064.

---

## Step 3 — What Codex must produce tonight
By the end of Batch A, the repo should contain:

### Remediation docs
- `/04-remediation/Master_Data_V2_Canonical_Domain_Map.md`
- `/04-remediation/Master_Data_V2_Entity_Inventory.csv`
- `/04-remediation/Master_Data_V2_Bounded_Context_Map.md`
- `/04-remediation/Master_Data_V2_Salvage_Patch_Replace_Map.md`
- `/04-remediation/Master_Data_V2_Open_Decisions.md`
- plus the R003-R009 remediation docs

### Prompt files
- `/04-remediation/prompts/R002_...`
- `/04-remediation/prompts/R003_...`
- `/04-remediation/prompts/R004_...`
- `/04-remediation/prompts/R005_...`
- `/04-remediation/prompts/R006_...`
- `/04-remediation/prompts/R007_...`
- `/04-remediation/prompts/R008_...`
- `/04-remediation/prompts/R009_...`

### Progress files
- `/docs/codex-progress/R002-output.md`
- `/docs/codex-progress/R003-output.md`
- `/docs/codex-progress/R004-output.md`
- `/docs/codex-progress/R005-output.md`
- `/docs/codex-progress/R006-output.md`
- `/docs/codex-progress/R007-output.md`
- `/docs/codex-progress/R008-output.md`
- `/docs/codex-progress/R009-output.md`
- updated `/docs/codex-progress/README.md`

---

## Step 4 — What Codex must NOT do tonight
Codex must **not**:
- run `P064`
- modify runtime code
- add migrations
- change controllers/services/DTOs/EF entities/tests
- create SQL rollout files for execution
- move into R010+ unless you explicitly start the next batch later

This batch is **docs-only**.

---

## Step 5 — What to check in the morning
Open these first:

1. `/docs/codex-progress/R009-output.md`
2. `/docs/codex-progress/README.md`
3. `/04-remediation/` newly created docs

Then run:

```bash
git status
```

You want to see **documentation changes only**.

---

## Step 6 — After Batch A
Do **not** jump to R013.
The next order is:

1. Review Batch A output
2. Run **Overnight Batch B** (`R010-R012`)
3. Review Batch B output
4. Run **R013 isolated**
5. Only after that, consider reopening the path toward `P064`

---

## Exactly what to run tonight

### Repo
- Branch: `gap-remediation-v2`
- Mode: new Codex chat, preferably **Worktree**

### Paste this file into Codex
- `Codex_Overnight_Batch_A_R002_R009.txt`

### Nothing else
- No standalone R002 first
- No Batch B yet
- No R013 yet
- No P064

