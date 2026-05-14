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
