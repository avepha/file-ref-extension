# Phase 1: Reference Engine - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the pure reference engine that validates supported editor inputs and produces deterministic file-reference strings for absolute and workspace-relative modes. This phase defines the normalization contract for line ranges and paths; command registration, clipboard writes, and user-facing VS Code wiring stay in later phases.

</domain>

<decisions>
## Implementation Decisions

### Relative path form
- **D-01:** Relative output should use the bare path relative to the containing workspace folder, such as `src/main.ts`, without prefixing the workspace folder name in MVP.
- **D-02:** When no containing workspace folder applies, relative mode should fall back to the absolute path rather than emitting a special placeholder or failure.

### Selection edges
- **D-03:** If a selection ends at column `0` of the next line, normalize the copied range so it ends on the previous line.
- **D-04:** Single-line outcomes should always collapse to `path:line`, even when the user made an explicit same-line selection.

### Path identity
- **D-05:** The engine should preserve the path identity VS Code already exposes for the document instead of resolving symlinks, aliases, or other canonical filesystem paths.

### Windows paths
- **D-06:** Windows absolute paths should keep the native drive-letter form, such as `C:/repo/file.ts`, while normalizing separators to forward slashes.

### the agent's Discretion
- Internal helper names, result-object shape, and test fixture organization can follow standard TypeScript extension conventions as long as the decisions above remain locked.
- Internal validation failures may use typed reasons or structured results, but they must support a clear single failure path for unsupported editor states in later phases.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product contract
- `PRODUCT_REQUIREMENTS.md` — Original product definition, output rules, supported editor scope, default path examples, and explicit MVP exclusions.
- `.planning/PROJECT.md` — Core value, active requirements summary, project constraints, and locked product boundaries.
- `.planning/REQUIREMENTS.md` — Phase 1 requirements `EDIT-01`, `EDIT-02`, `REF-01` through `REF-05` that the engine must satisfy.
- `.planning/ROADMAP.md` — Phase 1 goal plus the specific outcomes and exit checks for Plans 1.1 and 1.2.

### Research guidance
- `.planning/research/SUMMARY.md` — Recommended architecture for a thin VS Code shell around a pure formatting core and the key Phase 1 risk areas.
- `.planning/research/PITFALLS.md` — Cross-platform and editor-state pitfalls that should shape validation rules and path/range tests.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — there is no existing application source to reuse, so Phase 1 establishes the first pure modules and test fixtures.

### Established Patterns
- Planning docs consistently favor a thin VS Code shell around pure logic — keep the reference engine framework-free and easy to test in isolation.
- MVP scope is intentionally strict — only saved local text files are supported, and ambiguous states should fail clearly.

### Integration Points
- Phase 1 should expose pure validation, range-normalization, path-resolution, and formatting helpers that Phase 2 command handlers can call directly.

</code_context>

<specifics>
## Specific Ideas

- Accepted the recommended defaults rather than exploring each gray area interactively.
- Keep the engine boring and deterministic: preserve the path users see in VS Code, normalize only what is necessary for consistent output, and avoid MVP-specific disambiguation features that belong in later phases.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-reference-engine*
*Context gathered: 2026-04-17*
