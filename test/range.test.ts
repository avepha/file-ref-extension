import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

import { formatNormalizedLine, normalizeSelectionLines } from '../src/range';

describe('normalizeSelectionLines', () => {
  it('uses the cursor line for an empty selection', () => {
    const result = normalizeSelectionLines({
      anchor: { line: 11, character: 3 },
      active: { line: 11, character: 3 },
    });

    assert.deepEqual(result, { kind: 'line', line: 12 });
    assert.equal(formatNormalizedLine(result), '12');
  });

  it('collapses a same-line selection to a single line', () => {
    const result = normalizeSelectionLines({
      anchor: { line: 6, character: 1 },
      active: { line: 6, character: 18 },
    });

    assert.deepEqual(result, { kind: 'line', line: 7 });
    assert.equal(formatNormalizedLine(result), '7');
  });

  it('returns a normalized range for a forward multi-line selection', () => {
    const result = normalizeSelectionLines({
      anchor: { line: 2, character: 4 },
      active: { line: 5, character: 9 },
    });

    assert.deepEqual(result, { kind: 'range', startLine: 3, endLine: 6 });
    assert.equal(formatNormalizedLine(result), '3-6');
  });

  it('normalizes reverse selections to the same range', () => {
    const result = normalizeSelectionLines({
      anchor: { line: 8, character: 2 },
      active: { line: 4, character: 7 },
    });

    assert.deepEqual(result, { kind: 'range', startLine: 5, endLine: 9 });
    assert.equal(formatNormalizedLine(result), '5-9');
  });

  it('treats an end-at-column-zero selection as ending on the previous line', () => {
    const result = normalizeSelectionLines({
      anchor: { line: 9, character: 4 },
      active: { line: 13, character: 0 },
    });

    assert.deepEqual(result, { kind: 'range', startLine: 10, endLine: 13 });
    assert.equal(formatNormalizedLine(result), '10-13');
  });

  it('collapses an end-at-column-zero edge to a single line when needed', () => {
    const result = normalizeSelectionLines({
      anchor: { line: 9, character: 4 },
      active: { line: 10, character: 0 },
    });

    assert.deepEqual(result, { kind: 'line', line: 10 });
    assert.equal(formatNormalizedLine(result), '10');
  });
});
