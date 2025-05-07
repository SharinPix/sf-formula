import { evaluate } from "./evaluate";
import { defaultFunctions } from "./functions";
import { parser } from "./parser";
export { parser };

export type Context = Record<string, unknown> | ((variables: string[]) => unknown);
export type Functions = Record<string, (...args: Array<()=> unknown>)=> unknown>;
export type Options = {functions: Functions};
export class FormulaError extends Error {};

export function formulaEval(formula: string, context: Context = {}, options: Options = { functions: defaultFunctions}): unknown {
  if (typeof formula !== 'string') throw new FormulaError('Formula should be a string');
  const res = parser.parse(formula);
  return evaluate(res, formula, context, options);
}
