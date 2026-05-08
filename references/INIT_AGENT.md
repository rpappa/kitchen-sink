# Initialize An Agent To Work In This Repo

Two harness-level guardrails are worth wiring up before pointing an agent at this codebase. Both are independent of any specific agent product — they describe a contract the harness should enforce, and leave the implementation to whatever hook system the harness exposes.

## 1. Quality-Check Stop Hook

Run `scripts/check.sh` before the agent ends its turn. If checks fail, surface the failures back to the agent so it must fix them before completing.

Principles:

- **Auto-fix first.** The lint task already runs `eslint . --fix`, so trivial formatting issues never reach the hook.
- **Use caching.** `npm run check` runs through turbo, which caches lint/typecheck/test per package. Cold runs are slow, warm runs are sub-second.
- **One source of truth.** Call the same `npm run check` developers and CI use — don't reimplement the pipeline.

What's set up:

- `scripts/check.sh` runs `npm run check`, prints failures to stderr, and exits `2`. It uses `PROJECT_DIR` when the harness provides it, then falls back to `git rev-parse --show-toplevel` so it works when invoked manually.
- A Stop-hook entry in `.claude/settings.json` points at it with a 120s timeout.

To wire it into a different harness:

1. Find the harness's stop / end-of-turn hook (the event that fires when the agent intends to finish, not after every tool call).
2. Point it at `scripts/check.sh` and pass the repo root as `PROJECT_DIR`.
3. Confirm the harness treats a non-zero exit as blocking and forwards stderr back to the agent. Adjust the script if the harness uses a different convention — keep the contract, don't reshape the pipeline.
4. Set a timeout that comfortably covers a cold-cache run.

Verify by giving a function an obviously wrong return type, asking the agent to do anything trivial, and confirming the typecheck failure is surfaced back at end-of-turn.

## 2. Pre-Edit Guard On `package.json` Dependencies

Block file-edit and file-write tool calls that change `dependencies`, `devDependencies`, `peerDependencies`, or `optionalDependencies` in any `package.json`. Agents should reach for `npm install <pkg>` / `npm uninstall <pkg>` instead.

Why:

- Direct manifest edits skip npm's resolver, so the lockfile silently drifts out of sync.
- Hand-picked version ranges miss peer constraints that npm would otherwise resolve correctly.
- Other manifest fields (`scripts`, `engines`, `workspaces`, `version`, repo-specific config blocks) are fine to edit directly — only the dependency lists need the guard.

To wire it into a harness:

1. Find the harness's pre-tool-use hook for whatever tool the agent uses to edit or overwrite files.
2. Match on paths like `**/package.json`.
3. Inspect the proposed change. For an edit-style call, compare old vs new contents and flag any modification inside the four dependency fields. For a full-file write, flag any non-empty dependency field in the new content.
4. On a hit, block the call and return a message telling the agent to use the npm CLI. The message itself does the teaching — the agent will retry through the correct path.

A lightweight implementation is to delegate the classification to a model (the hook prompt asks the model to compare old/new and return `{"ok": true/false, "reason": "..."}`). A purely-deterministic implementation that diffs the JSON is also fine — pick whichever the harness makes easier, preferrign the model classification approach to avoid being overly strict.

### Reference Implementation

The implementation in use here is a `PreToolUse` hook with two `prompt`-type sub-hooks — one for edit-style calls, one for full-file writes — both gated by a path matcher on `**/package.json`. Each sub-hook hands the tool input to a model with a tight classification prompt and parses a JSON verdict back.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "prompt",
            "if": "Edit(**/package.json)",
            "statusMessage": "Classifying package.json edit",
            "prompt": "Classify this Edit tool call on a package.json. Hook input: $ARGUMENTS\n\nDecision: does the edit add, remove, or modify a version string in any of these fields: dependencies, devDependencies, peerDependencies, optionalDependencies? Compare old_string vs new_string.\n\nRespond with JSON only. No prose, no markdown, no code fences.\n\nIf YES (dependency change):\n{\"ok\": false, \"reason\": \"Use `npm install <pkg>` or `npm uninstall <pkg>` instead of editing package.json directly — this keeps package-lock.json in sync and lets npm handle version resolution.\"}\n\nIf NO (edit touches only scripts, version, engines, workspaces, config blocks, or other non-dependency fields):\n{\"ok\": true}"
          },
          {
            "type": "prompt",
            "if": "Write(**/package.json)",
            "statusMessage": "Classifying package.json write",
            "prompt": "Classify this Write tool call on a package.json. Hook input: $ARGUMENTS\n\nThis is a full-file write. Decision: does the new content contain any entries in dependencies, devDependencies, peerDependencies, or optionalDependencies? (Empty objects or absent fields are fine.)\n\nRespond with JSON only. No prose, no markdown, no code fences.\n\nIf YES (dep fields are populated):\n{\"ok\": false, \"reason\": \"Don't hand-write dependency lists in package.json. For a new project, run `npm init -y && npm install <pkgs>`. For an existing one, `npm install <pkg>` — this keeps package-lock.json in sync.\"}\n\nIf NO (write contains only scripts, metadata, config blocks, or has empty/absent dep fields):\n{\"ok\": true}"
          }
        ]
      }
    ]
  }
}
```

Things worth understanding before adapting it:

- **Two sub-hooks, one per tool shape.** Edits arrive as old/new string pairs; writes arrive as full file contents. The classification prompts differ because the model needs different framing for each case.
- **`if` matchers narrow the scope.** Without them, every `Edit`/`Write` call would invoke the model. The matchers keep the cost confined to actual `package.json` changes.
- **JSON-only verdict.** The hook expects a strict `{"ok": ..., "reason": ...}` shape; any prose or markdown fences would break parsing. The prompt enforces this explicitly.
- **The `reason` is what the agent sees.** Treat it as direct instruction to the agent — the message should tell it exactly which command to run instead, not just that the edit is disallowed.
