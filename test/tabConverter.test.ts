/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as chai from 'chai';
import { convertIncrementalChange, convertLeadingTabs } from '../src/tabConverter';

const expect = chai.expect;

describe('convertLeadingTabs', () => {
  it('replaces a single leading tab with one space', () => {
    expect(convertLeadingTabs('\tkey: 1\n')).to.equal(' key: 1\n');
  });

  it('replaces multiple leading tabs with the same number of spaces', () => {
    expect(convertLeadingTabs('\t\tnested: 2\n')).to.equal('  nested: 2\n');
  });

  it('converts tabs mixed inside the leading whitespace run', () => {
    expect(convertLeadingTabs('  \tkey: v\n')).to.equal('   key: v\n');
    expect(convertLeadingTabs('\t \tkey: v\n')).to.equal('   key: v\n');
  });

  it('leaves tabs inside string values untouched', () => {
    expect(convertLeadingTabs('key: "a\tb"\n')).to.equal('key: "a\tb"\n');
    expect(convertLeadingTabs('\tkey: "a\tb"\n')).to.equal(' key: "a\tb"\n');
  });

  it('does not touch a tab that follows a non-whitespace character on the same line', () => {
    expect(convertLeadingTabs('key:\tvalue\n')).to.equal('key:\tvalue\n');
  });

  it('handles CRLF line endings', () => {
    expect(convertLeadingTabs('\ta: 1\r\n\tb: 2\r\n')).to.equal(' a: 1\r\n b: 2\r\n');
  });

  it('handles an empty string', () => {
    expect(convertLeadingTabs('')).to.equal('');
  });

  it('handles a single line without a trailing newline', () => {
    expect(convertLeadingTabs('\tkey: 1')).to.equal(' key: 1');
  });

  it('preserves total character length on every input', () => {
    const inputs = ['', '\tkey: 1', '\t\tkey: 1\n\t\tnested: 2\n', 'key: "a\tb"\n', '  \tkey: v\n', '\ta: 1\r\n\tb: 2\r\n'];
    for (const input of inputs) {
      expect(convertLeadingTabs(input).length).to.equal(input.length);
    }
  });

  it('is a no-op when there are no tabs', () => {
    const input = '  key: 1\n  nested:\n    leaf: v\n';
    expect(convertLeadingTabs(input)).to.equal(input);
  });

  it('handles multi-document YAML with tab indentation in both', () => {
    const input = '---\n\ta: 1\n---\n\tb: 2\n';
    expect(convertLeadingTabs(input)).to.equal('---\n a: 1\n---\n b: 2\n');
  });
});

describe('convertIncrementalChange', () => {
  it('returns the input unchanged when there are no tabs', () => {
    expect(convertIncrementalChange('hello', true)).to.equal('hello');
    expect(convertIncrementalChange('hello', false)).to.equal('hello');
    expect(convertIncrementalChange('', true)).to.equal('');
  });

  it('converts the first segment when it joins the line indentation', () => {
    expect(convertIncrementalChange('\tkey', true)).to.equal(' key');
    expect(convertIncrementalChange('\t\tkey', true)).to.equal('  key');
  });

  it('leaves the first segment alone when it does not join indentation', () => {
    expect(convertIncrementalChange('\tkey', false)).to.equal('\tkey');
    expect(convertIncrementalChange('a\tb', false)).to.equal('a\tb');
  });

  it('always converts the leading whitespace of segments after a newline', () => {
    expect(convertIncrementalChange('x\n\ty', false)).to.equal('x\n y');
    expect(convertIncrementalChange('x\n\ty', true)).to.equal('x\n y');
    expect(convertIncrementalChange('\tx\n\ty', true)).to.equal(' x\n y');
  });

  it('does not touch tabs that follow a non-whitespace character on a line', () => {
    expect(convertIncrementalChange('key:\tvalue', true)).to.equal('key:\tvalue');
    expect(convertIncrementalChange('a\n  b\tc', true)).to.equal('a\n  b\tc');
  });

  it('preserves total character length', () => {
    const inputs: Array<[string, boolean]> = [
      ['\tkey', true],
      ['x\n\ty', false],
      ['\tkey:\tval\n\tother', true],
      ['plain text', false],
    ];
    for (const [input, joins] of inputs) {
      expect(convertIncrementalChange(input, joins).length).to.equal(input.length);
    }
  });
});
