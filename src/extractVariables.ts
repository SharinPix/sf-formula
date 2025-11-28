import { Variable } from './parser.terms';
import { parser } from './parser';

export function extractVariables(formula: string) {
  const res = parser.parse(formula);
  const variables: string[] = [];
  res.cursor().iterate((cursor) => {
    if (cursor.type.id === Variable) {
      variables.push(formula.slice(cursor.from, cursor.to));
    }
  });
  return variables;
}
