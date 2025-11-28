import { LanguageSupport } from '@codemirror/language';
import { parser } from './language';
import { formulaLanguage } from './language';
import { Completion } from './completion';

export default function languagePack() {
  return new LanguageSupport(formulaLanguage, [Completion]);
}
export { parser };
