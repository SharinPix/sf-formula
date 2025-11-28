import {
  foldInside,
  foldNodeProp,
  indentNodeProp,
  LRLanguage,
} from '@codemirror/language';
// import { parser } from './parser';
import { formulaHighlight } from './highlight';

import { parser as rawParser } from './parser';
const parser = rawParser.configure({
  props: [
    formulaHighlight,
    indentNodeProp.add({
      Application: (context) =>
        context.column(context.node.from) + context.unit,
    }),
    foldNodeProp.add({
      Application: foldInside,
    }),
  ],
});
export const formulaLanguage = LRLanguage.define({
  name: 'formula',
  parser: parser,
  languageData: {
    closeBrackets: { brackets: ['(', '"'] },
  },
});

export { parser };
