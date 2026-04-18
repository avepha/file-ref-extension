# Phase 6: JetBrains Action Workflow - Pattern Map

**Mapped:** 2026-04-18
**Files analyzed:** 7
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyReferenceAction.kt` | action | request-response | `src/extension.ts` | role-match |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyAbsoluteReferenceAction.kt` | action | request-response | `src/commands.ts` + `src/extension.ts` | partial |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyRelativeReferenceAction.kt` | action | request-response | `src/commands.ts` + `src/extension.ts` | partial |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/platform/JetBrainsCopyReferenceWorkflow.kt` | service | request-response | `src/workflow.ts` | exact |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/platform/FileReferenceNotifications.kt` | service | event-driven | `src/workflow.ts` message branches | role-match |
| `jetbrains-plugin/src/main/resources/META-INF/plugin.xml` | config | event-driven | `package.json` command/keybinding contributions + existing `plugin.xml` | exact |
| `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/actions/*` | test | request-response | `test/manifest.test.ts`, `test/workflow.test.ts`, `EditorInputGuardsTest.kt` | exact |

## Pattern Assignments

### `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyReferenceAction.kt` (action, request-response)

**Analog:** `src/extension.ts`

**Thin host entrypoint pattern** ([src/extension.ts](/Users/farhan/Documents/file-ref-extension/src/extension.ts:8)):

```ts
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COPY_ABSOLUTE_REFERENCE_COMMAND, async () =>
      executeCopyReferenceCommand(
        {
          activeEditor: getActiveEditorForCommand(),
          clipboard: vscode.env.clipboard,
          notifications: vscode.window,
          workspaceFolders: vscode.workspace.workspaceFolders,
        },
        'absolute',
      ),
    ),
  );
}
```

**Pattern to copy:** keep the host layer thin. In JetBrains, `actionPerformed()` should gather `Project` and `Editor` from `AnActionEvent`, then delegate to one shared workflow helper rather than reimplementing copy logic in each action class.

**Supporting guard pattern** ([EditorInputGuards.kt](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorInputGuards.kt:38)):

```kotlin
fun validateEditorInput(editor: Editor?, project: Project?): EditorInputGuardResult {
    if (editor == null) {
        return unsupported(UnsupportedEditorReason.NO_ACTIVE_EDITOR)
    }
    ...
}
```

**Pattern to copy:** `update()` should reuse this shared boundary instead of inventing a second availability rule set.

### `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/platform/JetBrainsCopyReferenceWorkflow.kt` (service, request-response)

**Analog:** `src/workflow.ts`

**Shared workflow pattern** ([src/workflow.ts](/Users/farhan/Documents/file-ref-extension/src/workflow.ts:71)):

```ts
export async function executeCopyReferenceCommand(
  environment: CommandEnvironment,
  mode: ReferenceMode,
): Promise<CommandExecutionResult> {
  const editor = environment.activeEditor ? toEditorLike(environment.activeEditor) : environment.activeEditor;
  const workspaceFolders = toWorkspaceFolderLikes(environment.workspaceFolders ?? []);
  const result = buildFileReference(editor, mode, workspaceFolders);
  ...
}
```

**Pattern to copy:** create one JetBrains workflow helper that owns the full request-response path: `AnActionEvent` input, guard call, reference build, clipboard write, and notification routing.

**Success-message selection pattern** ([src/workflow.ts](/Users/farhan/Documents/file-ref-extension/src/workflow.ts:28)):

```ts
function successMessageFor(mode: ReferenceMode): string {
  return mode === 'absolute' ? ABSOLUTE_SUCCESS_MESSAGE : RELATIVE_SUCCESS_MESSAGE;
}
```

**Pattern to copy:** centralize effective-mode message selection so relative fallback can intentionally emit the absolute success copy.

### `jetbrains-plugin/src/main/resources/META-INF/plugin.xml` (config, event-driven)

**Analogs:** `package.json`, existing JetBrains `plugin.xml`

**Contribution metadata pattern** ([test/manifest.test.ts](/Users/farhan/Documents/file-ref-extension/test/manifest.test.ts:31)):

```ts
assert.deepEqual(commands, [
  {
    command: COPY_ABSOLUTE_REFERENCE_COMMAND,
    title: 'File Reference: Copy Absolute Path with Line',
  },
  {
    command: COPY_RELATIVE_REFERENCE_COMMAND,
    title: 'File Reference: Copy Relative Path with Line',
  },
]);
```

**Pattern to copy:** preserve paired absolute/relative action naming and keep registration metadata explicit and testable.

**Current JetBrains descriptor baseline** ([plugin.xml](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/src/main/resources/META-INF/plugin.xml:1)):

```xml
<idea-plugin>
    <id>com.avepha.file-reference</id>
    <name>File Reference</name>
    <vendor>avepha</vendor>
    <depends>com.intellij.modules.platform</depends>
</idea-plugin>
```

**Pattern to copy:** extend the existing descriptor in-place with `<actions>` and any feedback-related extensions, rather than scattering runtime registration into code.

### JetBrains action and workflow tests (test, request-response)

**Analogs:** `test/workflow.test.ts`, `test/manifest.test.ts`, `EditorInputGuardsTest.kt`, `FileReferenceBuilderTest.kt`

**Behavior-first workflow assertions** ([test/workflow.test.ts](/Users/farhan/Documents/file-ref-extension/test/workflow.test.ts:72)):

```ts
assert.deepEqual(clipboardWrites, ['/workspace/app/src/feature.ts:8']);
assert.deepEqual(infoMessages, [ABSOLUTE_SUCCESS_MESSAGE]);
```

**Pattern to copy:** verify clipboard writes and feedback messages as observable side effects, not just return values.

**Descriptor smoke-test style** ([PluginCompatibilitySmokeTest.kt](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/src/test/kotlin/com/avepha/filereference/PluginCompatibilitySmokeTest.kt:9)):

```kotlin
val descriptorStream = javaClass.getResourceAsStream("/META-INF/plugin.xml")
assertNotNull(descriptorStream, "plugin.xml should be available on the test classpath")
```

**Pattern to copy:** parse `plugin.xml` in tests to lock action IDs, menu placement, shortcut metadata, and any notification-group registration.

**Platform-backed editor fixture style** ([EditorInputGuardsTest.kt](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/src/test/kotlin/com/avepha/filereference/editor/EditorInputGuardsTest.kt:17)):

```kotlin
class EditorInputGuardsTest : BasePlatformTestCase() {
    fun testSupportedLocalEditorReturnsImmutableSnapshot() {
        val editor = openProjectFile("content/example.txt", "first line\nsecond line\nthird line\n")
        ...
    }
}
```

**Pattern to copy:** test action availability and invocation against real editor fixtures, not hand-built mocks.

## Shared Patterns

### Shared Behavior Source

- Treat `src/workflow.ts` as the behavioral source for copy success messages, clipboard failure handling, and effective-mode success wording. [src/workflow.ts](/Users/farhan/Documents/file-ref-extension/src/workflow.ts:17)
- Treat `EditorInputGuards.kt` and `FileReferenceBuilder.kt` as the only JetBrains sources of truth for supported editor validation and final reference formatting. [EditorInputGuards.kt](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorInputGuards.kt:38) [FileReferenceBuilder.kt](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/FileReferenceBuilder.kt:9)

### Test Structure

- Use descriptor-parsing smoke tests for plugin metadata and registration invariants.
- Use `BasePlatformTestCase` when action logic needs a real `Project` and `Editor`.
- Keep pure behavior checks in small Kotlin tests when the logic no longer depends on IntelliJ runtime objects.

### Message Consistency

- Reuse the existing product strings and fallback semantics from the VS Code workflow rather than inventing new JetBrains-only copy text.
- Keep success/failure selection in one shared helper so absolute mode, relative mode, and relative fallback all stay aligned.

---
*Phase: 06-jetbrains-action-workflow*
*Patterns mapped: 2026-04-18*
