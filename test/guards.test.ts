import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

import type { EditorLike } from '../src/contracts';
import { DEFAULT_UNSUPPORTED_MESSAGE, validateEditorInput } from '../src/guards';

function createEditor(overrides: Partial<EditorLike> = {}): EditorLike {
  return {
    document: {
      uri: {
        scheme: 'file',
        fsPath: '/repo/src/reference.ts',
      },
      isUntitled: false,
    },
    selection: {
      anchor: { line: 4, character: 2 },
      active: { line: 4, character: 2 },
    },
    isDiffEditor: false,
    ...overrides,
  };
}

describe('validateEditorInput', () => {
  it('accepts a saved local file editor', () => {
    const result = validateEditorInput(createEditor());

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.documentPath, '/repo/src/reference.ts');
      assert.deepEqual(result.value.selection, {
        anchor: { line: 4, character: 2 },
        active: { line: 4, character: 2 },
      });
    }
  });

  it('rejects a missing active editor', () => {
    const result = validateEditorInput(undefined);

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'no-active-editor');
      assert.equal(result.error.message, DEFAULT_UNSUPPORTED_MESSAGE);
    }
  });

  it('rejects diff editors explicitly', () => {
    const result = validateEditorInput(createEditor({ isDiffEditor: true }));

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'diff-editor');
      assert.equal(result.error.message, DEFAULT_UNSUPPORTED_MESSAGE);
    }
  });

  it('rejects untitled documents', () => {
    const result = validateEditorInput(
      createEditor({
        document: {
          uri: {
            scheme: 'file',
            fsPath: '',
          },
          isUntitled: true,
        },
      }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'untitled-document');
      assert.equal(result.error.message, DEFAULT_UNSUPPORTED_MESSAGE);
    }
  });

  it('rejects non-file documents', () => {
    const result = validateEditorInput(
      createEditor({
        document: {
          uri: {
            scheme: 'vscode-notebook-cell',
            fsPath: '/repo/notebook.ipynb',
          },
          isUntitled: false,
        },
      }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'non-file-scheme');
      assert.equal(result.error.message, DEFAULT_UNSUPPORTED_MESSAGE);
    }
  });
});
