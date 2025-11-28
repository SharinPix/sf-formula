import { styleTags, tags as t } from '@lezer/highlight';

export const formulaHighlight = styleTags({
  OrExpr: t.operator,
  CompOperator: t.operator,
  AddOperator: t.operator,
  MulOperator: t.operator,
  AndOperator: t.operator,
  OrOperator: t.operator,
  Number: t.number,
  Boolean: t.bool,
  VariableName: t.variableName,
  VariableAttribute: t.string,
  FunctionName: t.function(t.variableName),
  String: t.string,
  '( )': t.paren,
  '.': t.derefOperator,
  ',': t.separator,
});
