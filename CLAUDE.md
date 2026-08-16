# Claude Code guidance

Read and follow `AGENTS.md` before making changes. The commands and current baseline are documented in `docs/development.md`; the target Kubernetes layout is documented in `deploy/README.md`.

Additional Claude Code constraints:

- Do not broaden `.claude/settings.json` permissions as part of unrelated work.
- Ask before running destructive Docker, database, Git, or Kubernetes commands.
- Never read, print, or commit local environment files or credential material.
- Do not deploy or create external resources unless the user explicitly requests that action.
- Keep edits focused, run relevant checks, and summarize both the diff and any remaining validation gaps.
