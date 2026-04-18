# JetBrains Marketplace Submission

This runbook covers the manual submission path after the plugin has passed local validation.

## Inputs

- Packaged plugin ZIP from `jetbrains-plugin/build/distributions/`
- Validation steps from [docs/release-workflow.md](release-workflow.md)
- Canonical listing copy from [docs/marketplace-listing.md](marketplace-listing.md)
- Screenshot and asset checklist from [docs/marketplace-assets/README.md](marketplace-assets/README.md)

## Validation before submission

Run these commands from `jetbrains-plugin/`:

```bash
./gradlew test
./gradlew verifyMarketplaceReady
```

Confirm the distributable ZIP exists:

```bash
ls -1 build/distributions/
```

## Environment-backed readiness

These variables are already wired for future signing and publish automation:

- `CERTIFICATE_CHAIN`
- `PRIVATE_KEY`
- `PRIVATE_KEY_PASSWORD`
- `PUBLISH_TOKEN`

They are not required for the validation-only flow in this phase. `publishPlugin` is expected to remain dormant until `PUBLISH_TOKEN` is available.

## Manual submission checklist

1. Generate a fresh plugin ZIP under `build/distributions/`.
2. Confirm the verification commands from [docs/release-workflow.md](release-workflow.md) pass.
3. Pull title, summary, feature bullets, and release notes from [docs/marketplace-listing.md](marketplace-listing.md).
4. Attach the screenshots and packaged icon assets listed in [docs/marketplace-assets/README.md](marketplace-assets/README.md).
5. Upload the plugin ZIP through the JetBrains Marketplace submission flow.
6. Review all marketplace-visible metadata for consistency with `META-INF/plugin.xml`, including the plugin ID `com.avepha.copy-file-path-with-line-numbers`.

## Manual review expectations

JetBrains Marketplace pages are subject to manual review. Expect the review to look at:

- accuracy and completeness of the listing copy
- quality of the screenshots and packaged icon assets
- correctness of plugin metadata and compatibility claims
- whether the uploaded ZIP matches the validated artifact

## Submission notes

- Use the validated artifact from `build/distributions/` instead of rebuilding again mid-submission.
- If broader IDE compatibility coverage is needed for a release, rerun the verifier with an explicit `-PverifierIdeTargets=...` override before upload.
- Keep the product scope narrow in marketplace copy: deterministic file-path copying with line numbers for saved local files, no settings UI, no extra JetBrains surfaces.
