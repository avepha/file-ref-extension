# Phase 3: Release Readiness - Plan

**Planned:** 2026-04-17
**Status:** Ready for execution

## Objective

Turn the completed extension into a publishable public artifact by adding release metadata and packaging hygiene, then verify the existing copy workflow behaves consistently across the supported desktop platforms.

## Scope

- In scope: manifest hardening, release docs and assets, packaging scripts, VSIX hygiene, Marketplace and Open VSX publish workflow documentation, and cross-platform verification for the shipped copy behavior.
- Out of scope: new end-user features, alternate output formats, remote/web support expansion, and broader post-MVP polish.

## Plan Sequence

### Plan 3.1: Packaging, Metadata, and Cross-Platform Verification

**Outcome:** The extension can be packaged repeatably for public distribution, includes the required release assets and metadata, and has an explicit verification path showing the same command and formatting behavior on macOS, Windows, and Linux.

**Requirements:** REL-01, REL-02

**Implementation steps:**
1. Audit and fix release metadata in `package.json`, including any missing marketplace-required fields and product-contract mismatches in command titles or keybindings.
2. Add the root release assets needed for public distribution: `README`, `CHANGELOG`, `LICENSE`, and any required icon or repository references.
3. Add packaging hygiene files and scripts, including `vscode:prepublish`, publish/package commands, and `.vscodeignore` rules so the VSIX contains only the intended release contents.
4. Install and wire the release tooling needed for repeatable packaging to VS Code Marketplace and Open VSX.
5. Add or document a release checklist covering local build, tests, package generation, credential prerequisites, and publish steps for both services.
6. Add release-focused verification for cross-platform consistency, using automated checks where feasible and a concise manual smoke matrix where OS-hosted verification is still manual.
7. Run the full release validation path locally, including build, tests, and package generation, and record any remaining manual verification gaps explicitly.

**Exit checks:**
- `vsce package` succeeds from the repo with the intended bundled artifact and no missing-metadata blockers.
- The maintainer workflow for both VS Code Marketplace and Open VSX is documented and repeatable.
- The shipped command names, shortcuts, and feedback match the product contract.
- Cross-platform verification covers macOS, Windows, and Linux behavior for absolute copy, relative copy, unsupported editor handling, and slash-normalized output.

## Risks and Controls

- Release metadata can mask product drift. Compare manifest-facing command names and shortcuts directly against `PRODUCT_REQUIREMENTS.md` while hardening packaging.
- A clean local build does not prove a clean VSIX. Add `.vscodeignore` and inspect package output rather than assuming the bundle is enough.
- Marketplace and Open VSX have different publish requirements. Keep tooling and docs explicit for both so one path does not imply the other works.
- Cross-platform confidence can become hand-wavy if it is only described. Capture a concrete verification matrix and keep any untested cells visible.

## Verification Strategy

- Reuse the existing automated test suite as the baseline functional check before any release packaging work ships.
- Add focused release checks around manifest correctness and packageability rather than rebuilding runtime behavior tests from scratch.
- Generate a VSIX locally and verify the package contents and metadata as part of the completion criteria.
- Use an explicit macOS/Windows/Linux smoke matrix for final behavior checks, including one UI-host sanity check for clipboard-oriented runtime placement.

## Completion Signal

Phase 3 is complete when the repo can build and package a public-release-ready extension with documented Marketplace and Open VSX publish steps, required release assets in place, and a recorded verification path showing consistent copy behavior across macOS, Windows, and Linux.

---

*Phase: 03-release-readiness*
*Plan created: 2026-04-17*
