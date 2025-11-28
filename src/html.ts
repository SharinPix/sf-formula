import { parser } from './language';
import { highlightCode, classHighlighter } from '@lezer/highlight';

export function html(code: string) {
  const res = ['<span>'];
  highlightCode(
    code,
    parser.parse(code),
    classHighlighter,
    (text, classes) => {
      if (text.trim() === '') return;
      // res.push(`<span class="${classes}">${text}   ==> ${classes}</span><br>`)
      res.push(`<span class="${classes}">${text}</span>`);
    },
    () => {
      res.push('</span></span>');
    }
  );
  res.push('</span>');
  return res.join('');
}
