import { extractVariables } from '../src/extractVariables';

describe('extractVariables', () => {
  it('return the list of variables from the formula', () => {
    expect(extractVariables('')).toStrictEqual([]);
    expect(extractVariables('var')).toStrictEqual(['var']);
    expect(extractVariables('var.property')).toStrictEqual(['var.property']);
  });
});
