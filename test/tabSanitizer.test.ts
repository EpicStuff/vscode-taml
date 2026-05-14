import { expect } from 'chai';
import { sanitizeYamlIndentationTabs } from '../src/tabSanitizer';

describe('tab sanitizer', () => {
  it('replaces leading indentation tabs', () => {
    const input = '\troot:\n\t\tchild: value';
    const output = sanitizeYamlIndentationTabs(input);

    expect(output).to.equal(' root:\n  child: value');
  });

  it('keeps non-indentation tabs untouched', () => {
    const input = 'root: "a\tb"\nvalue:\n\titem:\tkeep';
    const output = sanitizeYamlIndentationTabs(input);

    expect(output).to.equal('root: "a\tb"\nvalue:\n item:\tkeep');
  });
});
