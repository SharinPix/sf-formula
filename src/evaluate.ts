import { Tree, TreeCursor } from '@lezer/common';
import {
  FormulaText,
  Number,
  MulExpr,
  String,
  Boolean,
  MulOperator,
  Term,
  AddOperator,
  Variable,
  Function,
  AddExpr,
  OrExpr,
  AndExpr,
  AndOperator,
  OrOperator,
  CompExpr,
  CompOperator,
  Array,
} from './parser.terms';
import type { Context, Options } from './formula';

function evaluate(
  tree: Tree,
  input: string,
  context: Context = {},
  options: Options = { functions: {} }
): unknown {
  function evaluateNode(cursor: TreeCursor): unknown {
    const node = cursor;
    if (!(cursor instanceof TreeCursor)) throw new Error('Node is not a tree');
    const nodeType: number = node.type.id;
    const text = function (cursor: TreeCursor) {
      return input.slice(cursor.from, cursor.to);
    };

    const getVariable = (variables: string[]): unknown => {
      if (typeof context === 'function') {
        return context(variables);
      } else {
        let value: unknown = context;
        for (const fieldName of variables) {
          if (
            typeof value === 'object' &&
            value !== null &&
            !Object.prototype.hasOwnProperty.call(value, fieldName)
          )
            return undefined;
          value = (value as Record<string, unknown>)[fieldName];
        }
        return value;
      }
    };
    const evaluateVariable = (cursor: TreeCursor): unknown => {
      if (!cursor.firstChild())
        throw new Error('Variable has no children' + text(cursor));
      const fieldName = text(cursor);
      const variables = [fieldName];
      while (cursor.nextSibling()) {
        variables.push(text(cursor));
      }
      cursor.parent();
      if (variables.length === 1 && variables[0] === 'null') return null;
      if (variables.length === 1 && variables[0] === 'undefined')
        return undefined;
      return getVariable(variables);
    };
    const evaluateFunction = (cursor: TreeCursor): unknown => {
      if (!cursor.firstChild())
        throw new Error('Expression has no children' + text(cursor));
      const name = text(cursor);
      const func = options.functions[name];
      const functionCursor = cursor.node.cursor();
      const args: Array<() => unknown> = [];
      while (cursor.nextSibling()) {
        const newCursor = cursor.node.cursor();
        args.push(() => {
          return evaluateNode(newCursor);
        });
      }
      cursor.parent();
      try {
        if (typeof func !== 'function')
          throw new Error('Function does not exists');
        return func(...args);
      } catch (e) {
        if (!(e instanceof Error))
          throw new Error('Function did not raise an error');
        functionCursor.parent();
        throw new Error(e.message + ' in ' + text(functionCursor));
      }
    };
    const evaluateArray = (cursor: TreeCursor): unknown[] => {
      const elements: unknown[] = [];
      if (!cursor.firstChild()) {
        cursor.parent();
        return elements;
      }
      do {
        elements.push(evaluateNode(cursor));
      } while (cursor.nextSibling());
      cursor.parent();
      return elements;
    };
    const eachChild = (callback: (index: number) => void): void => {
      let index = 0;
      if (!cursor.firstChild()) return;
      do {
        callback(index);
        index += 1;
      } while (cursor.nextSibling());
      cursor.parent();
    };

    let value: unknown, right: unknown;
    let operator: {
      id: number;
      text: string;
    };

    switch (nodeType) {
      case FormulaText:
      case Term:
      case MulExpr:
      case AddExpr:
      case OrExpr:
      case AndExpr:
      case CompExpr:
        eachChild((index) => {
          if (index === 0) {
            value = evaluateNode(cursor);
            return;
          }
          if (index % 2 === 0) {
            switch (operator.id) {
              case CompOperator:
                switch (operator.text) {
                  case '>=':
                    if (typeof value !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    right = evaluateNode(cursor);
                    if (typeof right !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    value = value >= right;
                    break;
                  case '<=':
                    if (typeof value !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    right = evaluateNode(cursor);
                    if (typeof right !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    value = value <= right;
                    break;
                  case '>':
                    if (typeof value !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    right = evaluateNode(cursor);
                    if (typeof right !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    value = value > right;
                    break;
                  case '<':
                    if (typeof value !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    right = evaluateNode(cursor);
                    if (typeof right !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    value = value < right;
                    break;
                  case '==':
                  case '=':
                    value = value === evaluateNode(cursor);
                    break;
                  case '!=':
                    value = value !== evaluateNode(cursor);
                    break;
                  default:
                    throw new Error('Unknown CompOperator');
                }
                break;
              case AndOperator:
                value = value && evaluateNode(cursor);
                break;
              case OrOperator:
                value = value || evaluateNode(cursor);
                break;
              case AddOperator:
                right = evaluateNode(cursor);
                switch (operator.text) {
                  case '&':
                  case '+':
                    if (
                      typeof value === 'number' &&
                      typeof right === 'number'
                    ) {
                      value = value + right;
                    } else if (
                      typeof value === 'string' &&
                      typeof right === 'string'
                    ) {
                      value = value + right;
                    } else {
                      throw new Error('Incompatible types' + text(cursor));
                    }
                    break;
                  case '-':
                    if (typeof value !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    if (typeof right !== 'number')
                      throw new Error('Value is not a number' + text(cursor));
                    value -= right;
                    break;
                  default:
                    throw new Error('Unknown AddOperator' + text(cursor));
                }
                break;
              case MulOperator:
                if (typeof value !== 'number')
                  throw new Error('Value is not a number' + text(cursor));
                right = evaluateNode(cursor);
                if (typeof right !== 'number')
                  throw new Error('Value is not a number' + text(cursor));
                switch (operator.text) {
                  case '*':
                    value *= right;
                    break;
                  case '/':
                    value = value / right;
                    break;
                  default:
                    throw new Error('Unknown MulOperator' + text(cursor));
                }
                break;
              default:
                throw new Error('Unknown CompExpr' + text(cursor));
            }
          } else {
            const Operators = [
              OrOperator,
              AndOperator,
              MulOperator,
              AddOperator,
              CompOperator,
            ];
            if (!Operators.includes(cursor.type.id))
              throw new Error(
                `Unknown operator !! ${cursor.type.name} "${text(cursor)}"`
              );
            operator = {
              id: cursor.type.id,
              text: text(cursor),
            };
          }
        });
        return value;
      case Number:
        return parseFloat(text(cursor));
      case String:
        value = text(cursor);
        if (typeof value !== 'string')
          throw new Error('Value is not a string' + text(cursor));
        return value.substring(1, value.length - 1);
      case Boolean:
        return text(cursor) === 'true';
      case Variable:
        return evaluateVariable(cursor);
      case Function:
        return evaluateFunction(cursor);
      case Array:
        return evaluateArray(cursor);
      default:
        if (nodeType === 0) return undefined;
        throw new Error(`Unknown node type: ${nodeType} ${text(cursor)}`);
    }
  }
  return evaluateNode(tree.cursor());
}

export { evaluate };
