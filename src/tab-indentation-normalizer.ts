import { TextDocumentContentChangeEvent } from 'vscode';

export function normalizeLeadingTabs(text: string): string {
  return text.replace(/^[ \t]+/gm, (indentation) => indentation.replace(/\t/g, ' '));
}

export function normalizeContentChangeEvent(change: TextDocumentContentChangeEvent): TextDocumentContentChangeEvent {
  if (typeof change.text !== 'string') {
    return change;
  }

  return {
    ...change,
    text: normalizeLeadingTabs(change.text),
  };
}
