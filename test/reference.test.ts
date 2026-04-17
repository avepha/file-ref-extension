import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

import type { EditorLike } from '../src/contracts';
import { DEFAULT_UNSUPPORTED_MESSAGE } from '../src/guards';
import { buildFileReference, formatFileReference } from '../src/reference';

function createEditor(overrides: Partial<EditorLike> = {}): EditorLike {
  return {
    document: {
      uri: {
        scheme: 'file',
        fsPath: '/workspace/app/src/main.ts',
      },
      isUntitled: false,
    },
    selection: {
      anchor: { line: 11, character: 2 },
      active: { line: 14, character: 3 },
    },
    isDiffEditor: false,
    ...overrides,
  };
}

describe('formatFileReference', () => {
  it('formats an absolute single-line reference', () => {
    const reference = formatFileReference(
      '/workspace/app/src/main.ts',
      {
        anchor: { line: 2, character: 1 },
        active: { line: 2, character: 9 },
      },
      'absolute',
    );

    assert.equal(reference, '/workspace/app/src/main.ts:3');
  });

  it('formats a relative multi-line reference', () => {
    const reference = formatFileReference(
      '/workspace/app/src/main.ts',
      {
        anchor: { line: 2, character: 1 },
        active: { line: 4, character: 9 },
      },
      'relative',
      [{ uri: { fsPath: '/workspace/app' } }],
    );

    assert.equal(reference, 'src/main.ts:3-5');
  });

  it('uses absolute fallback in relative mode outside a workspace', () => {
    const reference = formatFileReference(
      '/outside/app/src/main.ts',
      {
        anchor: { line: 0, character: 0 },
        active: { line: 0, character: 0 },
      },
      'relative',
      [{ uri: { fsPath: '/workspace/app' } }],
    );

    assert.equal(reference, '/outside/app/src/main.ts:1');
  });
});

describe('buildFileReference', () => {
  it('builds a reference from a supported editor', () => {
    const result = buildFileReference(createEditor(), 'relative', [
      { uri: { fsPath: '/workspace/app' } },
    ]);

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value, 'src/main.ts:12-15');
    }
  });

  it('returns the explicit unsupported failure for invalid editors', () => {
    const result = buildFileReference(
      createEditor({
        document: {
          uri: {
            scheme: 'untitled',
            fsPath: '',
          },
          isUntitled: true,
        },
      }),
      'absolute',
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.message, DEFAULT_UNSUPPORTED_MESSAGE);
      assert.equal(result.error.reason, 'untitled-document');
    }
  });
});
