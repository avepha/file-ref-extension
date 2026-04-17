## [1.0.1](https://github.com/avepha/file-ref-extension/compare/v1.0.0...v1.0.1) (2026-04-17)


### Bug Fixes

* clarify release workflow wording ([120f071](https://github.com/avepha/file-ref-extension/commit/120f071542d05cd7c9fd4345fe823585c22fe7c9))

# 1.0.0 (2026-04-17)


### Bug Fixes

* **01:** WR-01 clean compiled test output ([4480b37](https://github.com/avepha/file-ref-extension/commit/4480b378760584189d23ff384f14a1e27d1fe98d))
* **01:** WR-01 handle UNC workspace paths ([c7b724e](https://github.com/avepha/file-ref-extension/commit/c7b724eb57052eb0b0054b2fb0465254e9fbe266))
* **01:** WR-01 prefer deepest workspace folder ([2e2eceb](https://github.com/avepha/file-ref-extension/commit/2e2eceb931fadcc92b5ebbd3a2784402b6a1b943))
* **01:** WR-02 support POSIX root workspaces ([b8f2b0b](https://github.com/avepha/file-ref-extension/commit/b8f2b0bf70d99f52ac6b896543d037d16525b606))
* **01:** WR-03 allow shortcuts in read-only editors ([797c501](https://github.com/avepha/file-ref-extension/commit/797c501df0eac045fb212d73deb5f65848fd0c58))
* **01:** WR-04 target supported Node runtime ([e3c84be](https://github.com/avepha/file-ref-extension/commit/e3c84beb58f816b1987c2d5ecfaf9df449d4e67c))
* **02:** WR-01 guard missing clipboard writes ([34c41df](https://github.com/avepha/file-ref-extension/commit/34c41df448c37e6e2bf17e265c082d9adbf28af6))
* **02:** WR-01 handle clipboard write failures clearly ([feff347](https://github.com/avepha/file-ref-extension/commit/feff347a10871f68caafdda7fe6f84e450351ed2))
* **02:** WR-01 normalize vscode editor adapters ([8680274](https://github.com/avepha/file-ref-extension/commit/868027402bf6ca12cc2593b2035a8c7f2340e9cc))
* **02:** WR-02 align fallback success messaging ([85a1e77](https://github.com/avepha/file-ref-extension/commit/85a1e77cc746c9db5d1d64c8a7abd5af1bfe803d))
* **02:** WR-02 reject diff editors in command palette flow ([2f9c83c](https://github.com/avepha/file-ref-extension/commit/2f9c83c294ad429230b5dbf8b3afdd8be0ee798f))
* **03-03:** enforce audit review in release validation ([a03a989](https://github.com/avepha/file-ref-extension/commit/a03a989c31cde42907e3ef0e74a2ad5f1e39f31e))
* **03-03:** remove vulnerable audit dependency path ([332479c](https://github.com/avepha/file-ref-extension/commit/332479cabf5916357b9216682dc1ae1e92059211))
* **03:** tighten VSIX packaging hygiene ([01412d8](https://github.com/avepha/file-ref-extension/commit/01412d8f3a55a31d4cf063a9d256650f6a324f7b))
* **03:** WR-01 align VSIX asset inspection ([eee265a](https://github.com/avepha/file-ref-extension/commit/eee265a4ee548b1a8787e60fc444e571d6867036))
* **03:** WR-01 enforce VSIX inspection in CI ([79938bb](https://github.com/avepha/file-ref-extension/commit/79938bb9912a25cdc6439be4aa77ab9d65af1d6e))
* **03:** WR-01 restrict VSIX contents to allowlist ([5d65ea5](https://github.com/avepha/file-ref-extension/commit/5d65ea5a542014e0685881d14ca9a20b4ac9656c))
* **03:** WR-02 require core assets in VSIX inspection ([bebdcf2](https://github.com/avepha/file-ref-extension/commit/bebdcf24a4b109663f3ce808d4d85a7cdbaee735))
* **03:** WR-02 sync README shortcuts ([1318f3f](https://github.com/avepha/file-ref-extension/commit/1318f3f4a470ea902f8a39173b328d6c25be6e2e))
* **03:** WR-02 verify README command IDs ([3d23c95](https://github.com/avepha/file-ref-extension/commit/3d23c9595d8c37723f7d5d89a5bdfb13a2d70d2c))
* **03:** WR-03 scope audit gate to package job ([9196934](https://github.com/avepha/file-ref-extension/commit/9196934766265dfdf55a858ef640af367a58759b))
* update default copy shortcuts ([a5256c2](https://github.com/avepha/file-ref-extension/commit/a5256c296bb09c9f9b939b0c33eae1f572aeb2a9))


### Features

* **01:** add path resolution and reference formatting ([2a3ca0f](https://github.com/avepha/file-ref-extension/commit/2a3ca0f05c0343b236355eb4f2fafc03aafaf8f0))
* **01:** scaffold validation and range contract ([2251765](https://github.com/avepha/file-ref-extension/commit/2251765a57132ced4819ed40b3011258abddfd24))
* **02:** add clipboard copy and workflow feedback ([9cd62a5](https://github.com/avepha/file-ref-extension/commit/9cd62a595acde4c86a3c103e448376016a719d56))
* **02:** add command contributions and routing workflow ([99dd10f](https://github.com/avepha/file-ref-extension/commit/99dd10ff9a79f4ca7f45eddf2988aa724fc47393))
* **03:** prepare the extension for public release ([c65131d](https://github.com/avepha/file-ref-extension/commit/c65131d61ae916a0370246c92b8cc38ae2219d4e))

# Changelog

All notable changes to this project will be documented in this file.

## 0.0.1 - 2026-04-17

### Added

- Initial public-release metadata, packaging scripts, and release assets.
- Release checklist, VSIX hygiene rules, and cross-platform verification guidance.
- Marketplace/Open VSX publishing tooling and automated release validation workflow.
