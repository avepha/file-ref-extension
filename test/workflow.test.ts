import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

import type { EditorLike, WorkspaceFolderLike } from '../src/contracts';
import {
  ABSOLUTE_SUCCESS_MESSAGE,
  RELATIVE_SUCCESS_MESSAGE,
  executeCopyReferenceCommand,
  toEditorLike,
  toWorkspaceFolderLikes,
} from '../src/workflow';

function createEditor(overrides: Partial<EditorLike> = {}): EditorLike {
  return {
    document: {
      uri: {
        scheme: 'file',
        fsPath: '/workspace/app/src/feature.ts',
      },
      isUntitled: false,
    },
    selection: {
      anchor: { line: 7, character: 0 },
      active: { line: 7, character: 4 },
    },
    ...overrides,
  };
}

describe('workflow adapters', () => {
  it('preserves plain editor contracts without reshaping them', () => {
    const editor = createEditor();

    assert.equal(toEditorLike(editor), editor);
  });

  it('applies editor metadata overrides without losing the plain contract', () => {
    const editor = createEditor();

    assert.deepEqual(toEditorLike(editor, { isDiffEditor: true }), {
      ...editor,
      isDiffEditor: true,
    });
  });

  it('normalizes vscode-like editors with accessor-backed fields before applying overrides', () => {
    const document = {
      uri: {
        scheme: 'file',
        fsPath: '/workspace/app/src/feature.ts',
      },
      isUntitled: false,
    };
    const selection = {
      anchor: { line: 7, character: 0 },
      active: { line: 7, character: 4 },
    };

    const vscodeLikeEditor = Object.create(
      {
        get document() {
          return document;
        },
        get selection() {
          return selection;
        },
        edit(): Promise<boolean> {
          return Promise.resolve(true);
        },
      },
    ) as EditorLike & { edit(): Promise<boolean> };

    assert.deepEqual(toEditorLike(vscodeLikeEditor, { isDiffEditor: true }), {
      document,
      selection,
      isDiffEditor: true,
    });
  });

  it('normalizes workspace folders to the plain contract', () => {
    const workspaceFolders: WorkspaceFolderLike[] = [
      { uri: { fsPath: '/workspace/app' } },
      { uri: { fsPath: '/workspace/other' } },
    ];

    assert.deepEqual(toWorkspaceFolderLikes(workspaceFolders), workspaceFolders);
  });
});

describe('executeCopyReferenceCommand', () => {
  it('routes absolute mode through the shared reference engine', async () => {
    const clipboardWrites: string[] = [];
    const infoMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor(),
        clipboard: {
          async writeText(value: string): Promise<void> {
            clipboardWrites.push(value);
          },
        },
        notifications: {
          showErrorMessage(message: string): string {
            throw new Error(`unexpected error message: ${message}`);
          },
          showInformationMessage(message: string): string {
            infoMessages.push(message);
            return message;
          },
        },
        workspaceFolders: [{ uri: { fsPath: '/workspace/app' } }],
      },
      'absolute',
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value, '/workspace/app/src/feature.ts:8');
    }
    assert.deepEqual(clipboardWrites, ['/workspace/app/src/feature.ts:8']);
    assert.deepEqual(infoMessages, [ABSOLUTE_SUCCESS_MESSAGE]);
  });

  it('routes relative mode through the shared reference engine', async () => {
    const clipboardWrites: string[] = [];
    const infoMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor(),
        clipboard: {
          async writeText(value: string): Promise<void> {
            clipboardWrites.push(value);
          },
        },
        notifications: {
          showErrorMessage(message: string): string {
            throw new Error(`unexpected error message: ${message}`);
          },
          showInformationMessage(message: string): string {
            infoMessages.push(message);
            return message;
          },
        },
        workspaceFolders: [{ uri: { fsPath: '/workspace/app' } }],
      },
      'relative',
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value, 'src/feature.ts:8');
    }
    assert.deepEqual(clipboardWrites, ['src/feature.ts:8']);
    assert.deepEqual(infoMessages, [RELATIVE_SUCCESS_MESSAGE]);
  });

  it('shows the absolute success message when relative mode falls back outside the workspace', async () => {
    const clipboardWrites: string[] = [];
    const infoMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor(),
        clipboard: {
          async writeText(value: string): Promise<void> {
            clipboardWrites.push(value);
          },
        },
        notifications: {
          showErrorMessage(message: string): string {
            throw new Error(`unexpected error message: ${message}`);
          },
          showInformationMessage(message: string): string {
            infoMessages.push(message);
            return message;
          },
        },
        workspaceFolders: [{ uri: { fsPath: '/workspace/other' } }],
      },
      'relative',
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value, '/workspace/app/src/feature.ts:8');
      assert.equal(result.effectiveMode, 'absolute');
    }
    assert.deepEqual(clipboardWrites, ['/workspace/app/src/feature.ts:8']);
    assert.deepEqual(infoMessages, [ABSOLUTE_SUCCESS_MESSAGE]);
  });

  it('propagates validation failures from the shared guard flow', async () => {
    const clipboardWrites: string[] = [];
    const errorMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor({
          document: {
            uri: {
              scheme: 'untitled',
              fsPath: '',
            },
            isUntitled: true,
          },
        }),
        clipboard: {
          async writeText(value: string): Promise<void> {
            clipboardWrites.push(value);
          },
        },
        notifications: {
          showErrorMessage(message: string): string {
            errorMessages.push(message);
            return message;
          },
          showInformationMessage(message: string): string {
            throw new Error(`unexpected success message: ${message}`);
          },
        },
      },
      'relative',
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'untitled-document');
      assert.equal(result.error.message, 'No saved local text file is active');
    }
    assert.deepEqual(clipboardWrites, []);
    assert.deepEqual(errorMessages, ['No saved local text file is active']);
  });

  it('rejects diff editors before building a reference', async () => {
    const clipboardWrites: string[] = [];
    const errorMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor({ isDiffEditor: true }),
        clipboard: {
          async writeText(value: string): Promise<void> {
            clipboardWrites.push(value);
          },
        },
        notifications: {
          showErrorMessage(message: string): string {
            errorMessages.push(message);
            return message;
          },
          showInformationMessage(message: string): string {
            throw new Error(`unexpected success message: ${message}`);
          },
        },
      },
      'absolute',
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'diff-editor');
      assert.equal(result.error.message, 'No saved local text file is active');
    }
    assert.deepEqual(clipboardWrites, []);
    assert.deepEqual(errorMessages, ['No saved local text file is active']);
  });

  it('returns a clear failure when clipboard writes are rejected', async () => {
    const errorMessages: string[] = [];
    const infoMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor(),
        clipboard: {
          async writeText(): Promise<void> {
            throw new Error('clipboard unavailable');
          },
        },
        notifications: {
          showErrorMessage(message: string): string {
            errorMessages.push(message);
            return message;
          },
          showInformationMessage(message: string): string {
            infoMessages.push(message);
            return message;
          },
        },
        workspaceFolders: [{ uri: { fsPath: '/workspace/app' } }],
      },
      'absolute',
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'clipboard-write-failed');
      assert.equal(result.error.message, 'Failed to copy file reference');
    }
    assert.deepEqual(errorMessages, ['Failed to copy file reference']);
    assert.deepEqual(infoMessages, []);
  });

  it('returns a clear failure when the clipboard service is missing', async () => {
    const errorMessages: string[] = [];
    const infoMessages: string[] = [];

    const result = await executeCopyReferenceCommand(
      {
        activeEditor: createEditor(),
        notifications: {
          showErrorMessage(message: string): string {
            errorMessages.push(message);
            return message;
          },
          showInformationMessage(message: string): string {
            infoMessages.push(message);
            return message;
          },
        },
        workspaceFolders: [{ uri: { fsPath: '/workspace/app' } }],
      },
      'absolute',
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.reason, 'clipboard-write-failed');
      assert.equal(result.error.message, 'Failed to copy file reference');
    }
    assert.deepEqual(errorMessages, ['Failed to copy file reference']);
    assert.deepEqual(infoMessages, []);
  });
});
