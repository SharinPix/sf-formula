import {completeFromList, snippet, type Completion as CompletionType } from "@codemirror/autocomplete"
import { formulaLanguage } from './language';

const singleArg: CompletionType[] = ['NOT', 'ABS', 'ACOS', 'ASIN', 'SIN', 'TAN', 'ATAN', 'ATAN2', 'EXP', 'LN', 'LOG', 'ISNUMBER','ISBLANK', 'ISNULL', 'TEXT','FLOOR', 'CEILING', 'LEN', 'MCEILING', 'MFLOOR', 'SQRT', 'SUM', 'REMOVEBLANKS'].map((func)=> {
  return {
    label: func,
    apply: snippet(`${func}(\${value})`),
  };
})
export const functions: CompletionType[] = [
  ...singleArg,
  {
    label: 'IF',
    apply: snippet(`IF(\n\t\${true},\n\t\${"ok"},\n\t\${"ko"}\n)`),
  },
  {
    label: 'CASE',
    apply: snippet(`CASE(\n\t\${value},\n\t\${true}, \${"ok"},\n\t\${false},\${"KO"}\n)`),
  },
  ...singleArg,
  {
    label: 'MIN',
    apply: snippet(`MIN(\${0:value}, \${1:0})`),
  },
  {
    label: 'MAX',
    apply: snippet(`MAX(\${0:value}, \${1:0})`),
  },
  {
    label: 'ROUND',
    apply: snippet(`ROUND(\${value}, \${2})`),
  },
  {
    label: 'TRUNC',
    apply: snippet(`TRUNC(\${value}, \${2})`),
  },
  {
    label: 'BLANKVALUE',
    apply: snippet(`BLANKVALUE(\${value}, \${"Default"})`),
  },
  {
    label: 'NULLVALUE',
    apply: snippet(`NULLVALUE(\${value}, \${"Default"})`),
  },
  {
    label: 'INCLUDES',
    apply: snippet(`INCLUDES(\${value}, \${"value"})`),
  },
  {
    label: 'COUNTMATCHES',
    apply: snippet(`COUNTMATCHES(\${value}, \${"value"})`),
  },
]

export const operators: CompletionType[] = '> < >= <= & + - * / AND OR'.split(' ').map((operator) => {
    return {
    label: operator,
    apply: snippet(`\${value} ${operator} \${value}`),
  }}
);

export const values: CompletionType[] = [
  {
    label: 'true',
    apply: `true`,
  },
  {
    label: 'false',
    apply: `false`,
  },
  {
    label: 'String',
    apply: snippet(`"\${Hello World}"`),
  },
  {
    label: 'Number',
    apply: snippet(`"\${12}"`),
  }
]

export const completionList: CompletionType[]= [
  ...functions,
  ...operators,
  ...values,
]

export const Completion = formulaLanguage.data.of({
  autocomplete: completeFromList(completionList)
})

export default {
  Completion,
  completionList,
  functions,
  operators,
  values,
}