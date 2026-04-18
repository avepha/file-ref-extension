# Marketplace Assets Checklist

Capture and collect these assets before the first JetBrains Marketplace submission.

## Packaged plugin assets

- `jetbrains-plugin/src/main/resources/META-INF/pluginIcon.svg`
- `jetbrains-plugin/src/main/resources/META-INF/pluginIcon_dark.svg`

## Screenshot set

Store captured screenshots in this directory using these names:

- `editor-popup-action.png` - Editor context or popup entry showing the copy action.
- `find-action-results.png` - Find Action search results showing both copy actions with the renamed labels.
- `absolute-copy-notification.png` - Success notification after copying an absolute file reference.
- `relative-copy-fallback.png` - Relative action run on an out-of-project file showing absolute fallback behavior.

## Capture guidance

- Use a recent JetBrains IDE build that matches the verified plugin artifact.
- Prefer PyCharm for the default Phase 7 capture pass.
- Use real file paths and line numbers that demonstrate deterministic `path:line` or `path:start-end` output.
- Crop screenshots so the action, result, and context are visible without extra UI noise.

## Submission handoff

Before manual submission, confirm this directory contains the named screenshots above plus the packaged icon files referenced from `META-INF/`.
