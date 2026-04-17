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
});
