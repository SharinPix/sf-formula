import {
  formulaEval,
  languagePack,
  html,
  extractVariables,
} from 'sf-formula/src';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { json } from '@codemirror/lang-json';
import { oneDark as theme } from '@codemirror/theme-one-dark';

class FormulaDemo {
  private resultDiv: HTMLElement;
  private editorView!: EditorView;
  private variablesView!: EditorView;
  private inputContainer: HTMLElement;
  private formulaVariables: HTMLElement;
  private formula = 'IF(x +  y + nested.property > 0, "Yes", "No")';
  private demoVariables = {
    x: 10,
    nested: {
      property: 1,
      b: 2,
      c: 3,
    },
    y: 5,
    name: 'John',
    isActive: true,
    PI: Math.PI,
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    balance: 1500.75,
    skills: 'JavaScript;TypeScript;React;Node.js',
    colors: 'Red;Blue;Green',
    departments: 'Sales;Marketing;Engineering',
    items: ['Passed', 'Failed', 'Passed'],
    issues: [3, 1, 3],
    dateString: '2024-01-01',
    date: new Date('2024-01-01'),
  };

  constructor() {
    this.resultDiv = document.getElementById('result') as HTMLElement;
    this.inputContainer = document.getElementById(
      'formulaInputContainer'
    ) as HTMLElement;
    this.formulaVariables = document.getElementById(
      'formulaVariables'
    ) as HTMLElement;

    this.initializeCodeMirror();
    this.evaluateFormula();
  }

  private initializeCodeMirror(): void {
    this.inputContainer.innerHTML = '';
    const startState = EditorState.create({
      doc: this.formula,
      extensions: [
        basicSetup,
        languagePack(),
        theme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.formula = this.editorView.state.doc.toString().trim();
            this.evaluateFormula();
          }
        }),
      ],
    });

    const variablesState = EditorState.create({
      doc: JSON.stringify(this.demoVariables, null, 2),
      extensions: [
        basicSetup,
        json(),
        theme,
        linter(jsonParseLinter()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            try {
              this.demoVariables = JSON.parse(
                this.variablesView.state.doc.toString().trim()
              );
            } catch (e) {
              console.error(e);
            }
            this.evaluateFormula();
          }
        }),
      ],
    });

    this.variablesView = new EditorView({
      state: variablesState,
      parent: this.formulaVariables,
    });

    this.editorView = new EditorView({
      state: startState,
      parent: this.inputContainer,
    });
  }

  evaluateFormula(): void {
    try {
      const result = formulaEval(this.formula, this.demoVariables);
      this.showResult(result, this.formula, extractVariables(this.formula));
    } catch (error) {
      this.showError(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  loadExample(example: string): void {
    this.editorView.dispatch({
      changes: {
        from: 0,
        to: this.editorView.state.doc.length,
        insert: example,
      },
    });

    this.editorView.focus();
    this.evaluateFormula();
  }

  private showResult(
    result: unknown,
    formula: string,
    variables: string[]
  ): void {
    const resultType = typeof result;
    const displayResult = this.formatResult(result);

    this.resultDiv.innerHTML = `
            <div class="result">
                <strong>Result:</strong> <code>${this.escapeHtml(displayResult)}</code><br>
                <strong>Type:</strong> <span style="color: #666; font-size: 0.9em;">${resultType}</span><br>
                <strong>Formula:</strong> <code>${html(formula)}</code></br>
                <strong>Variables listed in the formula:</strong> <code>${variables.join(', ')}</code>
            </div>
        `;
  }

  private showError(message: string): void {
    this.resultDiv.innerHTML = `
            <div class="error">
                ${this.escapeHtml(message)}
            </div>
        `;
  }

  private formatResult(result: unknown): string {
    if (typeof result === 'string') {
      return `"${result}"`;
    } else if (typeof result === 'number') {
      // Format numbers nicely
      return Number.isInteger(result)
        ? result.toString()
        : result.toFixed(6).replace(/\.?0+$/, '');
    } else if (typeof result === 'boolean') {
      return result ? 'TRUE' : 'FALSE';
    } else if (result === null) {
      return 'NULL';
    } else if (result === undefined) {
      return 'UNDEFINED';
    } else {
      return String(result);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global variables and functions that the HTML expects
let demoInstance: FormulaDemo;

// Global function for the HTML button
function evaluateFormula(): void {
  if (demoInstance) {
    demoInstance.evaluateFormula();
  }
}

// Global function for example buttons
function loadExample(example: string): void {
  if (demoInstance) {
    demoInstance.loadExample(example);
  }
}

// Make functions available globally
(
  window as typeof window & {
    evaluateFormula: typeof evaluateFormula;
    loadExample: typeof loadExample;
  }
).evaluateFormula = evaluateFormula;
(
  window as typeof window & {
    evaluateFormula: typeof evaluateFormula;
    loadExample: typeof loadExample;
  }
).loadExample = loadExample;

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
  demoInstance = new FormulaDemo();
});
