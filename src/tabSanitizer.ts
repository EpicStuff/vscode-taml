export function sanitizeYamlIndentationTabs(text: string): string {
  return text.replace(/^[ \t]+/gm, (indent) => indent.replace(/\t/g, ' '));
}
