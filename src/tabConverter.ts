/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Replace each `\t` inside the leading-whitespace run of every line with one
// space. Substitution is 1:1 in characters, so LSP positions (line, UTF-16
// offset) stay valid in both the original and converted text. Tabs that appear
// after the leading-whitespace run (e.g. inside a quoted string) are untouched.
export function convertLeadingTabs(text: string): string {
  return text.replace(/^[ \t]+/gm, (run) => run.replace(/\t/g, ' '));
}

// Convert the `text` portion of one incremental LSP change event. Only tabs
// that land in an indentation position are replaced.
//
// `firstSegmentJoinsIndentation` is supplied by the caller (which holds the
// document state): true iff every character on the affected line before the
// insertion point is whitespace, so the inserted text's leading whitespace
// continues that line's leading-indent run. Segments after an embedded
// newline always start a fresh line at column 0, so their leading whitespace
// is unconditionally indentation.
export function convertIncrementalChange(text: string, firstSegmentJoinsIndentation: boolean): string {
  if (!text.includes('\t')) return text;
  const segments = text.split('\n');
  return segments
    .map((seg, i) => {
      if (i === 0 && !firstSegmentJoinsIndentation) return seg;
      return seg.replace(/^[ \t]+/, (run) => run.replace(/\t/g, ' '));
    })
    .join('\n');
}
