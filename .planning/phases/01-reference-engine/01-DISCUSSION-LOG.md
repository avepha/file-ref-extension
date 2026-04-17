# Phase 1: Reference Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 1-Reference Engine
**Areas discussed:** Relative path form, Selection edges, Path identity, Windows paths

---

## Relative path form

| Option | Description | Selected |
|--------|-------------|----------|
| Bare path from containing workspace folder | Matches the PRD examples and keeps MVP output short and predictable | ✓ |
| Prefix workspace folder name | Adds disambiguation for multi-root cases, but changes the default output shape | |
| Always use absolute path | Avoids ambiguity, but defeats the purpose of the relative command | |

**User's choice:** Accept the recommended default and use bare paths from the containing workspace folder.
**Notes:** Multi-root disambiguation remains deferred to a later phase instead of altering MVP output now.

---

## Selection edges

| Option | Description | Selected |
|--------|-------------|----------|
| Snap end-at-column-0 back to previous line | Produces the line range users typically expect when selecting whole lines | ✓ |
| Include the next line | Mirrors the raw editor end position, but often produces one extra line in copied output | |
| Preserve raw editor positions | Exposes editor internals directly and makes output harder to predict | |

**User's choice:** Accept the recommended default and treat end-at-column-0 as the previous line.
**Notes:** This keeps copied ranges intuitive and avoids accidental extra-line inclusion.

---

## Path identity

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve editor-visible path | Keeps copied references aligned with what the user sees in VS Code | ✓ |
| Resolve symlinks | Produces filesystem-real paths, but may surprise users when the copied path changes | |
| Canonicalize to real filesystem path | Maximizes normalization, but drifts furthest from the user-visible editor context | |

**User's choice:** Accept the recommended default and preserve the editor-visible path.
**Notes:** The copied reference should feel like a direct export of the active editor state, not a rewritten filesystem identity.

---

## Windows paths

| Option | Description | Selected |
|--------|-------------|----------|
| `C:/repo/file.ts` style | Preserves the familiar Windows absolute path shape while meeting the POSIX-separator requirement | ✓ |
| `file:///C:/repo/file.ts` style | Fully URI-shaped, but noisier for AI-tool pasting | |
| `/c/repo/file.ts` style | Looks POSIX-like, but is not the path form Windows users expect from VS Code | |

**User's choice:** Accept the recommended default and keep drive-letter absolute paths with forward slashes.
**Notes:** Separator normalization should not invent a new Windows path identity.

---

## the agent's Discretion

- Internal helper boundaries and result types.
- Exact unit test file layout and fixture organization.

## Deferred Ideas

- None.
