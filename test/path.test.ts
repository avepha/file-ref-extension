import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

import { normalizeToPosixPath, resolveReferencePath } from '../src/path';

describe('normalizeToPosixPath', () => {
  it('normalizes Windows separators to forward slashes', () => {
    assert.equal(normalizeToPosixPath('C:\\repo\\src\\main.ts'), 'C:/repo/src/main.ts');
  });

  it('leaves POSIX paths unchanged', () => {
    assert.equal(normalizeToPosixPath('/repo/src/main.ts'), '/repo/src/main.ts');
  });
});

describe('resolveReferencePath', () => {
  it('returns the absolute path in absolute mode', () => {
    assert.equal(
      resolveReferencePath('/workspace/app/src/main.ts', 'absolute', [
        { uri: { fsPath: '/workspace/app' } },
      ]),
      '/workspace/app/src/main.ts',
    );
  });

  it('returns a containing-folder relative path in relative mode', () => {
    assert.equal(
      resolveReferencePath('/workspace/app/src/main.ts', 'relative', [
        { uri: { fsPath: '/workspace/app' } },
      ]),
      'src/main.ts',
    );
  });

  it('falls back to the absolute path outside the workspace', () => {
    assert.equal(
      resolveReferencePath('/outside/app/src/main.ts', 'relative', [
        { uri: { fsPath: '/workspace/app' } },
      ]),
      '/outside/app/src/main.ts',
    );
  });

  it('returns a root-relative path when the POSIX root is the workspace folder', () => {
    assert.equal(
      resolveReferencePath('/workspace/app/src/main.ts', 'relative', [
        { uri: { fsPath: '/' } },
      ]),
      'workspace/app/src/main.ts',
    );
  });

  it('uses the containing workspace folder in multi-root setups', () => {
    assert.equal(
      resolveReferencePath('/workspace/beta/src/main.ts', 'relative', [
        { uri: { fsPath: '/workspace/alpha' } },
        { uri: { fsPath: '/workspace/beta' } },
      ]),
      'src/main.ts',
    );
  });

  it('prefers the deepest containing workspace folder in nested multi-root setups', () => {
    assert.equal(
      resolveReferencePath('/repo/packages/app/src/main.ts', 'relative', [
        { uri: { fsPath: '/repo' } },
        { uri: { fsPath: '/repo/packages/app' } },
      ]),
      'src/main.ts',
    );
  });

  it('preserves Windows drive letters while normalizing separators', () => {
    assert.equal(
      resolveReferencePath('C:\\repo\\src\\main.ts', 'absolute'),
      'C:/repo/src/main.ts',
    );
  });

  it('returns a Windows relative path when the file is inside the workspace', () => {
    assert.equal(
      resolveReferencePath('C:\\repo\\src\\main.ts', 'relative', [
        { uri: { fsPath: 'C:\\repo' } },
      ]),
      'src/main.ts',
    );
  });

  it('falls back to the normalized absolute path for a different Windows drive', () => {
    assert.equal(
      resolveReferencePath('D:\\repo\\src\\main.ts', 'relative', [
        { uri: { fsPath: 'C:\\repo' } },
      ]),
      'D:/repo/src/main.ts',
    );
  });
});
