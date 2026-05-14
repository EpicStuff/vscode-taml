import assert = require('assert');
import { normalizeContentChangeEvent, normalizeLeadingTabs } from '../src/tab-indentation-normalizer';

describe('tab indentation normalizer', () => {
  it('replaces tabs only in line indentation', () => {
    const input = '\troot:\n\t\tchild: "a\tb"\n  \tstillIndent: ok\ninline:\ta';
    const output = normalizeLeadingTabs(input);

    assert.equal(output, ' root:\n  child: "a\tb"\n   stillIndent: ok\ninline:\ta');
  });

  it('normalizes text in content changes', () => {
    const change = {
      range: undefined,
      rangeOffset: 0,
      rangeLength: 0,
      text: '\tfoo:\n\t\tbar: baz',
    };

    const normalized = normalizeContentChangeEvent(change);
    assert.equal(normalized.text, ' foo:\n  bar: baz');
  });
});
