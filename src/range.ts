import type { NormalizedLineOutput, PositionLike, SelectionLike } from './contracts';

function comparePositions(left: PositionLike, right: PositionLike): number {
  if (left.line !== right.line) {
    return left.line - right.line;
  }

  return left.character - right.character;
}

function orderSelection(selection: SelectionLike): { start: PositionLike; end: PositionLike } {
  return comparePositions(selection.anchor, selection.active) <= 0
    ? { start: selection.anchor, end: selection.active }
    : { start: selection.active, end: selection.anchor };
}

export function normalizeSelectionLines(selection: SelectionLike): NormalizedLineOutput {
  const { start, end } = orderSelection(selection);

  if (comparePositions(start, end) === 0) {
    return { kind: 'line', line: start.line + 1 };
  }

  const normalizedEndLine = end.character === 0 && end.line > start.line ? end.line - 1 : end.line;
  const startLine = start.line + 1;
  const endLine = normalizedEndLine + 1;

  if (startLine === endLine) {
    return { kind: 'line', line: startLine };
  }

  return {
    kind: 'range',
    startLine,
    endLine,
  };
}

export function formatNormalizedLine(output: NormalizedLineOutput): string {
  return output.kind === 'line' ? `${output.line}` : `${output.startLine}-${output.endLine}`;
}
