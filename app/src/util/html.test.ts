import { escapeHTML } from './html';

describe('escapeHtml', () => {
  it('should escape HTML', () => {
    expect(escapeHTML('<script>alert("hi")</script>')).toEqual('&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt;');
  });

  it('should replace newlines with <br/>', () => {
    expect(escapeHTML('hello\nworld')).toEqual('hello<br/>world');
  });

  it('should replace multiple spaces a single space and multiple non-breaking spaces', () => {
    expect(escapeHTML('hello  world')).toEqual('hello &nbsp;world');
  });

  it('should add an extra line break at the end of the string', () => {
    expect(escapeHTML('hello\n')).toEqual('hello<br/><br/>');
  });

  it('should escape spaces at the beginning of a line', () => {
    expect(escapeHTML('  hello\n  there!')).toEqual('&nbsp;&nbsp;hello<br/>&nbsp;&nbsp;there!');
  });
});