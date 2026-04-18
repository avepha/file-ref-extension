# Phase 6: JetBrains Action Workflow - Research

**Researched:** 2026-04-18
**Domain:** JetBrains action registration, keyboard access, clipboard copy, and concise user feedback
**Confidence:** HIGH

## User Constraints

No `06-CONTEXT.md` exists for this phase, so implementation details remain at the agent's discretion unless already locked by roadmap, requirements, or prior phase artifacts.

Constraints inferred from roadmap, requirements, prior phase output, and AGENTS.md:
- Preserve the shipped File Reference product contract: deterministic `path:line` / `path:start-end` output, direct clipboard copy, and concise feedback with no confirmation step.
- Keep Phase 6 limited to JetBrains-native actions, keyboard access, clipboard execution, and user feedback. Do not add settings UI, richer JetBrains-only surfaces such as tool windows, or marketplace work here.
- Keep JetBrains host entrypoints thin. Reuse the verified Phase 5 engine instead of re-implementing path or line logic in action classes.
- Maintain broad JetBrains compatibility by staying within platform-level editor/action/notification APIs and avoiding product-specific dependencies unless the current code genuinely needs them.
- Keep the implementation lightweight and easy to understand for future contributors; favor small host adapters around the pure reference engine.

## Project Constraints (from AGENTS.md)

- Use the GSD workflow artifacts under `.planning/` as the source of truth for phase planning. [VERIFIED: local codebase]
- Prefer fast codebase search and existing patterns before inventing new abstractions. [VERIFIED: local codebase]
- Keep product logic separate from host side effects, matching the current VS Code workflow split. [VERIFIED: local codebase]
- Avoid unnecessary UI expansion or maintainability-heavy structure; the product promise is still a one-step clipboard action with minimal friction. [VERIFIED: local codebase]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Action discovery, menu registration, and shortcuts | `actions` package + `plugin.xml` | IntelliJ Action System | The action layer should own IDs, presentation text, keyboard entry points, and availability rules. |
| Host-to-engine adaptation | `platform` package | `editor` + `reference` packages | JetBrains `AnActionEvent` data should be converted once, then passed into the existing Phase 5 guard and builder. |
| Clipboard writes | `platform` package | IntelliJ clipboard API | Direct clipboard side effects belong outside the pure reference engine. |
| Success/failure feedback | `platform` package | IntelliJ notification APIs | User messaging should be centralized so wording stays concise and consistent across absolute/relative modes. |
| Deterministic reference formatting | `reference` package | `editor` snapshot model | Phase 5 already owns this behavior; Phase 6 should consume it, not duplicate it. |

## Summary

JetBrains actions must be both implemented and registered. The official Action System docs state that actions need code plus registration, should override `update()` and `actionPerformed()`, and should implement `getActionUpdateThread()`. JetBrains recommends background-thread action updates when the action needs read access to project models, VFS, or PSI, which fits this phase because availability depends on the current editor, file, and project context. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]

Registered actions automatically become discoverable through standard action surfaces. The Creating Actions tutorial shows that once an action is registered in `plugin.xml`, it is available from both a menu group and Find Action, and keyboard shortcuts can be declared directly in the action registration. The Action System docs also expose search-focused registration metadata such as `synonym` entries. That means Phase 6 can satisfy discovery and quick keyboard access by combining `plugin.xml` action registrations, `keyboard-shortcut` entries, search aliases, and at least one standard JetBrains menu or popup group. [CITED: https://plugins.jetbrains.com/docs/intellij/creating-actions-tutorial.html] [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]

The safest design for this phase is the same host-adapter pattern already proven in the repo. Thin JetBrains `DumbAwareAction` classes should read `Project` and `Editor` from `AnActionEvent`, run the existing `validateEditorInput()` boundary from Phase 5, and delegate final formatting to `buildFileReference()`. Action classes should stay stateless because JetBrains warns that `AnAction` instances live for the lifetime of the application and must not hold shorter-lived state. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] [VERIFIED: local codebase]

For testing, the IntelliJ SDK docs explicitly recommend `BasePlatformTestCase` and document `performEditorAction()` for invoking editor actions in in-memory test contexts. That pairs well with the repo's current JetBrains test setup and lets Phase 6 validate both action availability and action execution against real editor fixtures instead of mocks. [CITED: https://plugins.jetbrains.com/docs/intellij/tests-and-fixtures.html] [CITED: https://plugins.jetbrains.com/docs/intellij/writing-tests.html] [VERIFIED: local codebase]

For feedback, JetBrains docs say action results that do not require immediate user input should use notification balloons, and balloon copy should stay short, sentence case, and severity-appropriate. The locally resolved JetBrains runtime for this project includes `NotificationGroupManager`, which gives the phase a concrete platform-native way to centralize those results without new dependencies. Phase 6 should therefore use concise informational feedback on success and clear error feedback on failure, while avoiding modal dialogs or sticky suggestion-style notifications. [CITED: https://plugins.jetbrains.com/docs/intellij/notification-types.html] [CITED: https://plugins.jetbrains.com/docs/intellij/balloon.html] [VERIFIED: local IntelliJ 2026.1 runtime jar]

**Primary recommendation:** Split Phase 6 into two plans. First, register thin JetBrains actions with correct availability rules, keyboard shortcuts, and execution wiring into the verified Phase 5 engine. Second, centralize clipboard and notification side effects so action execution produces direct copy behavior plus concise success and failure messaging without leaking IntelliJ host details into the pure reference packages.

## Standard Stack

### Core
| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| IntelliJ Action System (`AnAction`, `DumbAwareAction`, `AnActionEvent`) | existing Phase 4 baseline | Register actions, evaluate context, and handle user invocation | This is the official JetBrains mechanism for menu, popup, keyboard, and Find Action entry points. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] |
| `plugin.xml` `<actions>` registrations | existing Phase 4 baseline | Action IDs, menu groups, and shortcut declarations | JetBrains documents `plugin.xml` registration as the standard declarative path for menu placement and shortcuts. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] [CITED: https://plugins.jetbrains.com/docs/intellij/creating-actions-tutorial.html] |
| Existing Phase 5 JetBrains engine (`validateEditorInput()` + `buildFileReference()`) | local repo baseline | Deterministic reference building and unsupported-state handling | Already verified and purpose-built for this product contract; Phase 6 should consume it directly. [VERIFIED: local codebase] |
| BasePlatform test framework | existing Phase 4 baseline | Action/update execution tests in real editor fixtures | Already configured in `jetbrains-plugin/build.gradle.kts` and recommended by JetBrains for plugin tests. [CITED: https://plugins.jetbrains.com/docs/intellij/tests-and-fixtures.html] [VERIFIED: local codebase] |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `performEditorAction()` in tests | Simulate editor action execution in-memory | Use when validating shortcut-like action behavior against a live test editor. [CITED: https://plugins.jetbrains.com/docs/intellij/writing-tests.html] |
| IntelliJ notification balloon APIs + `NotificationGroupManager` | Surface concise success/failure results | Use for non-blocking results after an action runs outside a dialog-bound context. [CITED: https://plugins.jetbrains.com/docs/intellij/notification-types.html] [CITED: https://plugins.jetbrains.com/docs/intellij/balloon.html] [VERIFIED: local IntelliJ 2026.1 runtime jar] |
| IntelliJ clipboard API (`CopyPasteManager`) | Write the final reference to the system clipboard | Use as the platform-owned clipboard boundary instead of hand-rolled AWT clipboard plumbing. [ASSUMED] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `plugin.xml` action registration | programmatic action registration | More dynamic, but unnecessary overhead for two stable copy actions. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] |
| Thin action classes delegating to shared workflow helpers | heavy logic inside `actionPerformed()` | Faster to start, but violates JetBrains guidance against stateful/bloated `AnAction` classes and makes testing harder. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] |
| Notification balloons for results | modal dialogs or ad hoc popups | More intrusive than the product needs and contrary to JetBrains guidance for non-blocking action results. [CITED: https://plugins.jetbrains.com/docs/intellij/notification-types.html] |

## Architecture Patterns

### Pattern 1: Thin stateless actions delegating to shared workflow helpers
**What:** Keep `DumbAwareAction` classes responsible only for action metadata, availability checks, and passing the current `Project`/`Editor` into a shared helper.
**When to use:** For both absolute and relative copy actions.
**Why:** JetBrains warns against storing state in `AnAction` classes, and the repo already prefers thin host entrypoints. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] [VERIFIED: local codebase]

### Pattern 2: Reuse the Phase 5 guard and builder instead of re-checking editor state in multiple places
**What:** Let `update()` rely on `validateEditorInput()` for supported-editor gating, and let `actionPerformed()` call the same guard plus `buildFileReference()` for execution.
**When to use:** Whenever the current editor must be checked for local-file support, single-caret state, or deterministic reference formatting.
**Why:** This preserves one boundary for unsupported states and keeps Phase 6 focused on host surfaces. [VERIFIED: local codebase]

### Pattern 3: Register discovery and keyboard surfaces declaratively in `plugin.xml`
**What:** Declare action IDs, text, descriptions, menu placement, and keyboard shortcuts in `plugin.xml`.
**When to use:** For the two stable copy actions in this phase.
**Why:** JetBrains documents this as the standard registration model, and registered actions become available to Find Action as well as menu groups and keymaps. [CITED: https://plugins.jetbrains.com/docs/intellij/creating-actions-tutorial.html] [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]

### Pattern 4: Centralize clipboard and notification side effects in a `platform` helper
**What:** Create one JetBrains-side workflow/service that owns clipboard writes and success/failure notifications, while actions and the pure engine stay unaware of platform UI details.
**When to use:** For final action execution once the reference string is built.
**Why:** This mirrors the repo's existing `src/workflow.ts` pattern and keeps host-specific effects isolated. [VERIFIED: local codebase]

### Anti-Patterns to Avoid
- **Stateful action classes:** Do not store `Project`, `Editor`, clipboard state, or cached references on `AnAction` instances. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]
- **Re-implementing Phase 5 logic in the action layer:** Do not duplicate path resolution or line normalization in `actions` or `platform`.
- **Slow or heavy `update()` logic:** Do not perform clipboard writes, notification creation, or expensive work in `update()`. JetBrains expects it to stay fast. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]
- **Over-expanding UI scope:** Do not turn this phase into settings, tool windows, or marketplace polish.
- **Verbose or sticky success notifications:** The product promise is quick copy with minimal friction; success feedback should stay short and lightweight. [CITED: https://plugins.jetbrains.com/docs/intellij/balloon.html]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Action discovery and keymaps | Custom registries or manual key handling | `plugin.xml` `<actions>` + `keyboard-shortcut` | JetBrains already provides the standard registration model. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html] |
| Action availability evaluation | Duplicate per-action editor/file checks | `validateEditorInput()` boundary from Phase 5 | The guard logic already captures supported vs unsupported editor state. [VERIFIED: local codebase] |
| Action tests | Mock-heavy fake IDE environments | `BasePlatformTestCase` and editor fixtures | JetBrains docs recommend real components/tests over custom mocking infrastructure. [CITED: https://plugins.jetbrains.com/docs/intellij/tests-and-fixtures.html] [CITED: https://plugins.jetbrains.com/docs/intellij/testing-plugins.html] |
| Result feedback | Modal dialogs or ad hoc custom popups | notification balloon APIs with concise messages | Official guidance fits this phase's non-blocking action-result use case. [CITED: https://plugins.jetbrains.com/docs/intellij/notification-types.html] [CITED: https://plugins.jetbrains.com/docs/intellij/balloon.html] |

## Common Pitfalls

### Pitfall 1: Letting actions appear in unsupported editors
**What goes wrong:** Copy actions show up in scratch, non-local, multi-caret, or otherwise unsupported editors and then fail unexpectedly.
**Why it happens:** Availability checks drift away from the shared guard rules or only verify that an editor exists.
**How to avoid:** Use `validateEditorInput()` in `update()` so the same supported-state rules drive both visibility and execution. [VERIFIED: local codebase]
**Warning signs:** Manual tests show the action in editors that Phase 5 explicitly rejects.

### Pitfall 2: Doing too much inside `update()`
**What goes wrong:** Menu rendering or toolbar refresh becomes slow, or actions behave inconsistently because `update()` does work that should happen later.
**Why it happens:** `update()` starts building references, reading clipboard state, or doing other execution work.
**How to avoid:** Keep `update()` to cheap context checks and move real work to `actionPerformed()`. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]
**Warning signs:** The update path contains clipboard code, notifications, or deep file-system work.

### Pitfall 3: Splitting success/failure messages across action classes
**What goes wrong:** Absolute and relative actions drift in wording, fallback behavior, or error handling.
**Why it happens:** Each action class formats its own messages and handles clipboard failures independently.
**How to avoid:** Centralize side effects and message selection in a shared JetBrains workflow helper, just as the VS Code implementation centralizes copy execution in `src/workflow.ts`. [VERIFIED: local codebase]
**Warning signs:** Similar strings or failure branches start appearing in multiple action classes.

### Pitfall 4: Choosing action surfaces that hide disabled actions unintentionally
**What goes wrong:** Maintainers expect to see the action gray-disabled in a menu, but the host menu hides it entirely because of compact behavior.
**Why it happens:** The action is only registered in menu groups where disabled items are hidden.
**How to avoid:** Use the editor popup and Find Action as the primary action surfaces, and verify menu-group behavior deliberately when choosing any additional menu location. [CITED: https://plugins.jetbrains.com/docs/intellij/action-system.html]
**Warning signs:** Actions disappear from menus during manual verification instead of simply disabling.

### Pitfall 5: Overcomplicating keyboard workflow coverage
**What goes wrong:** Shortcut logic becomes platform-specific or brittle, or tests only prove registration without any execution coverage.
**Why it happens:** Keyboard support is treated as a special subsystem instead of normal action registration plus action execution tests.
**How to avoid:** Register shortcuts declaratively in `plugin.xml`, then verify both metadata and action execution using BasePlatform editor fixtures. [CITED: https://plugins.jetbrains.com/docs/intellij/creating-actions-tutorial.html] [CITED: https://plugins.jetbrains.com/docs/intellij/writing-tests.html]
**Warning signs:** Shortcut behavior relies on custom key listeners or bypasses the Action System.

## Verification Strategy

- Add plugin descriptor tests that parse `plugin.xml` and verify both copy actions are registered with stable IDs, discovery text, menu placement, and keyboard shortcut metadata. [VERIFIED: local codebase] [CITED: https://plugins.jetbrains.com/docs/intellij/creating-actions-tutorial.html]
- Add BasePlatform action/update tests proving the actions are enabled only for supported saved local editors and hidden/disabled for unsupported editor states. [CITED: https://plugins.jetbrains.com/docs/intellij/tests-and-fixtures.html] [VERIFIED: local codebase]
- Add workflow/action execution tests that verify absolute and relative copy outputs reach the clipboard, relative fallback still copies the absolute string, and failure paths avoid stale clipboard writes. [ASSUMED] [VERIFIED: local codebase]
- Add feedback tests proving success uses concise informational messaging, failure uses error messaging, and relative fallback success uses the absolute success message to match the existing product behavior. [VERIFIED: local codebase] [CITED: https://plugins.jetbrains.com/docs/intellij/notification-types.html]

## Proposed Plan Split

### Plan 06-01
Register JetBrains-native absolute and relative copy actions, scope their visibility to supported editors, add keyboard-driven entry points, and wire them into the verified Phase 5 engine plus direct clipboard copy.

### Plan 06-02
Centralize clipboard and notification side effects into a shared JetBrains workflow layer so successful copies show concise success feedback and validation/clipboard failures surface clear error messaging without duplicating host logic across actions.

## Sources

Official JetBrains sources:
- https://plugins.jetbrains.com/docs/intellij/action-system.html
- https://plugins.jetbrains.com/docs/intellij/creating-actions-tutorial.html
- https://plugins.jetbrains.com/docs/intellij/tests-and-fixtures.html
- https://plugins.jetbrains.com/docs/intellij/writing-tests.html
- https://plugins.jetbrains.com/docs/intellij/testing-plugins.html
- https://plugins.jetbrains.com/docs/intellij/notification-types.html
- https://plugins.jetbrains.com/docs/intellij/balloon.html
- https://plugins.jetbrains.com/docs/intellij/threading-model.html

Repo-local sources:
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-RESEARCH.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-PATTERNS.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-02-SUMMARY.md`
- `.planning/phases/05-reference-copy-engine/05-RESEARCH.md`
- `.planning/phases/05-reference-copy-engine/05-01-PLAN.md`
- `.planning/phases/05-reference-copy-engine/05-01-SUMMARY.md`
- `.planning/phases/05-reference-copy-engine/05-02-PLAN.md`
- `.planning/phases/05-reference-copy-engine/05-02-SUMMARY.md`
- `jetbrains-plugin/docs/architecture.md`
- `jetbrains-plugin/build.gradle.kts`
- `jetbrains-plugin/src/main/resources/META-INF/plugin.xml`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorInputGuards.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/FileReferenceBuilder.kt`
- `src/extension.ts`
- `src/workflow.ts`
- `test/workflow.test.ts`
- `test/manifest.test.ts`

---
*Phase: 06-jetbrains-action-workflow*
*Research created: 2026-04-18*
