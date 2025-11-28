import { html } from '../src/html';

describe('highlight', () => {
  it('should highlight a simple formula', () => {
    expect(html('x + y')).toBe(
      '<span><span class="tok-variableName">x</span><span class="tok-operator">+</span><span class="tok-variableName">y</span></span>'
    );
  });
});
